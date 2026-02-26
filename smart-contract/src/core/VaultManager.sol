// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {
    AutomationCompatibleInterface
} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {
    IRouterClient
} from "@chainlink/contracts-ccip/interfaces/IRouterClient.sol";
import {
    CCIPReceiver
} from "@chainlink/contracts-ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/libraries/Client.sol";

interface IMockAave {
    function supply(uint256 amount) external;
    function withdrawByAmount(
        uint256 amount
    ) external returns (uint256 sharesBurned);
    function getSupplyAPY() external view returns (uint256);
    function getPoolInfo()
        external
        view
        returns (
            uint256 totalSupply,
            uint256 totalBorrow,
            uint256 supplyRate,
            uint256 borrowRate,
            uint256 utilization
        );
    function getUserSupplyBalance(address user) external view returns (uint256);
}

// .                                     #*******       #******##
// .                                   ##*********#    **********##
// .                                  #************    ***********##
// .                                ##*************    ***********####
// .                               ###*************    ************####
// .                             %###*************      ************####
// .                            #####*************      #***********######
// .                            #####************        ***********######
// .                           %####************          **********#######
// .                           #####**********              ********#######
// .                           ######********    %#*****#    #*****########
// .                           ######******     ###***# **     #**#########
// .                            ######***#     #####******#     #*########
// .                            ##########     %###########     ##########
// .                             ########       %#########       ########
// .                              ########        ######        ########
// .                               %######         ####         #######
// .                                 #######       ####       #######
// .                                  ##############*###############
// .                                    ############*#############
// .                                     %######################%
// .                                       ####################
// .                                         ################
// .                                           ############
// .                                            %########%
// .                                              %####%

contract VaultManager is
    CCIPReceiver,
    AutomationCompatibleInterface,
    ReentrancyGuard
{
    using SafeERC20 for IERC20;

    error Unauthorized();
    error ZeroAmount();
    error InvalidChain(uint64 chainSelector);
    error InvalidSender(address sender);
    error CooldownActive(uint256 availableAt);
    error BridgeCostTooHigh(uint256 cost, uint256 limit);
    error YieldDeltaTooLow(uint256 delta, uint256 threshold);
    error VaultPaused();
    error InsufficientBalance(uint256 requested, uint256 available);
    error TransferAmountTooLow();

    event Deposited(address indexed user, uint256 amount, uint256 sharesIssued);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event RebalanceTriggered(
        uint64 indexed targetChain,
        uint256 amount,
        bytes32 messageId
    );
    event RebalanceReceived(uint64 indexed sourceChain, uint256 amount);
    event YieldDataUpdated(
        uint64 indexed chainSelector,
        uint256 supplyRate,
        uint256 timestamp
    );
    event EmergencyPaused(address triggeredBy);
    event EmergencyUnpaused(address triggeredBy);
    event TrustedVaultSet(uint64 chainSelector, address vault);
    event LinkFunded(address indexed funder, uint256 amount);
    event TotalAssetsSynced(uint256 oldValue, uint256 newValue);

    uint256 public constant YIELD_DELTA_THRESHOLD = 2e16;
    uint256 public constant BRIDGE_COST_LIMIT = 50e6;
    uint256 public constant REBALANCE_COOLDOWN = 24 hours;
    uint256 public constant MAX_BREAKEVEN_DAYS = 14;
    uint256 public constant MAX_TRANSFER_BPS = 2000;
    uint256 public constant MIN_TRANSFER_AMOUNT = 100e6;

    IERC20 public immutable usdc;
    IMockAave public immutable aave;
    IRouterClient public immutable ccipRouter;
    IERC20 public immutable linkToken;
    uint64 public immutable currentChainSelector;

    address public owner;
    address public creOperator;
    address public automationForwarder;

    uint256 public totalShares;
    uint256 public totalAssets;
    mapping(address => uint256) public userShares;
    bool public paused;

    uint256 public lastRebalanceTimestamp;

    struct ChainYieldData {
        uint256 supplyRate;
        uint256 timestamp;
        bool active;
    }

    mapping(uint64 => ChainYieldData) public chainYieldData;
    uint64[] public monitoredChains;
    mapping(uint64 => address) public trustedVaults;

    bytes32 public constant ACTION_REBALANCE_IN = keccak256("REBALANCE_IN");

    struct RebalanceOpportunity {
        uint64 targetChain;
        uint256 targetRate;
        uint256 currentRate;
        uint256 delta;
        uint256 transferAmount;
        bool exists;
    }

    constructor(
        address _ccipRouter,
        address _usdc,
        address _aave,
        address _linkToken,
        uint64 _currentChainSelector,
        address _creOperator
    ) CCIPReceiver(_ccipRouter) {
        ccipRouter = IRouterClient(_ccipRouter);
        usdc = IERC20(_usdc);
        aave = IMockAave(_aave);
        linkToken = IERC20(_linkToken);
        currentChainSelector = _currentChainSelector;
        creOperator = _creOperator;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyCRE() {
        if (msg.sender != creOperator) revert Unauthorized();
        _;
    }

    modifier onlyAutomation() {
        if (automationForwarder != address(0)) {
            if (msg.sender != automationForwarder) revert Unauthorized();
        } else {
            if (msg.sender != owner) revert Unauthorized();
        }
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert VaultPaused();
        _;
    }

    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();

        _syncTotalAssets();

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 shares;
        if (totalShares == 0 || totalAssets == 0) {
            shares = amount;
        } else {
            shares = (amount * totalShares) / totalAssets;
        }

        userShares[msg.sender] += shares;
        totalShares += shares;
        totalAssets += amount;

        usdc.approve(address(aave), amount);
        aave.supply(amount);

        emit Deposited(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (shares > userShares[msg.sender])
            revert InsufficientBalance(shares, userShares[msg.sender]);

        _syncTotalAssets();

        uint256 amount = (shares * totalAssets) / totalShares;

        uint256 aaveBalance = aave.getUserSupplyBalance(address(this));
        if (amount > aaveBalance) amount = aaveBalance;

        userShares[msg.sender] -= shares;
        totalShares -= shares;
        totalAssets -= amount;

        aave.withdrawByAmount(amount);
        usdc.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, shares);
    }

    function updateYieldData(
        uint64 chainSelector,
        uint256 supplyRate
    ) external onlyCRE {
        chainYieldData[chainSelector] = ChainYieldData({
            supplyRate: supplyRate,
            timestamp: block.timestamp,
            active: true
        });

        bool found = false;
        for (uint256 i = 0; i < monitoredChains.length; i++) {
            if (monitoredChains[i] == chainSelector) {
                found = true;
                break;
            }
        }
        if (!found) monitoredChains.push(chainSelector);

        emit YieldDataUpdated(chainSelector, supplyRate, block.timestamp);
    }

    function emergencyPause() external onlyCRE {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (paused) return (false, "");
        if (
            lastRebalanceTimestamp != 0 &&
            block.timestamp < lastRebalanceTimestamp + REBALANCE_COOLDOWN
        ) return (false, "");

        RebalanceOpportunity memory opp = _findBestOpportunity();
        if (!opp.exists) return (false, "");

        performData = abi.encode(
            opp.targetChain,
            opp.transferAmount,
            opp.delta
        );
        upkeepNeeded = true;
    }

    function performUpkeep(
        bytes calldata performData
    ) external override onlyAutomation nonReentrant whenNotPaused {
        (uint64 targetChain, uint256 transferAmount, ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );

        if (
            lastRebalanceTimestamp != 0 &&
            block.timestamp < lastRebalanceTimestamp + REBALANCE_COOLDOWN
        ) revert CooldownActive(lastRebalanceTimestamp + REBALANCE_COOLDOWN);

        uint256 currentLocalRate = aave.getSupplyAPY();
        ChainYieldData memory targetData = chainYieldData[targetChain];

        if (targetData.supplyRate <= currentLocalRate + YIELD_DELTA_THRESHOLD)
            revert YieldDeltaTooLow(
                targetData.supplyRate > currentLocalRate
                    ? targetData.supplyRate - currentLocalRate
                    : 0,
                YIELD_DELTA_THRESHOLD
            );

        _syncTotalAssets();
        uint256 currentBalance = aave.getUserSupplyBalance(address(this));
        if (transferAmount > currentBalance) transferAmount = currentBalance;
        if (transferAmount < MIN_TRANSFER_AMOUNT) revert TransferAmountTooLow();

        lastRebalanceTimestamp = block.timestamp;
        totalAssets -= transferAmount;

        aave.withdrawByAmount(transferAmount);

        bytes32 messageId = _sendCCIP(targetChain, transferAmount);

        emit RebalanceTriggered(targetChain, transferAmount, messageId);
    }

    function _sendCCIP(
        uint64 targetChain,
        uint256 amount
    ) internal returns (bytes32 messageId) {
        address targetVault = trustedVaults[targetChain];
        if (targetVault == address(0)) revert InvalidChain(targetChain);

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: amount
        });

        bytes memory data = abi.encode(ACTION_REBALANCE_IN, amount);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(targetVault),
            data: data,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 300_000})
            ),
            feeToken: address(linkToken)
        });

        uint256 fee = ccipRouter.getFee(targetChain, message);
        uint256 bridgeCostLimitNormalized = uint256(BRIDGE_COST_LIMIT) * 1e12;
        if (fee > bridgeCostLimitNormalized)
            revert BridgeCostTooHigh(fee, bridgeCostLimitNormalized);

        linkToken.approve(address(ccipRouter), fee);
        usdc.approve(address(ccipRouter), amount);

        messageId = ccipRouter.ccipSend(targetChain, message);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override whenNotPaused {
        uint64 sourceChain = message.sourceChainSelector;
        address sender = abi.decode(message.sender, (address));
        if (trustedVaults[sourceChain] == address(0))
            revert InvalidChain(sourceChain);
        if (trustedVaults[sourceChain] != sender) revert InvalidSender(sender);

        (bytes32 action, ) = abi.decode(message.data, (bytes32, uint256));

        if (action == ACTION_REBALANCE_IN) {
            uint256 receivedAmount = 0;
            for (uint256 i = 0; i < message.destTokenAmounts.length; i++) {
                if (message.destTokenAmounts[i].token == address(usdc)) {
                    receivedAmount = message.destTokenAmounts[i].amount;
                    break;
                }
            }
            if (receivedAmount == 0) return;

            usdc.approve(address(aave), receivedAmount);
            aave.supply(receivedAmount);
            totalAssets += receivedAmount;

            emit RebalanceReceived(sourceChain, receivedAmount);
        }
    }

    function _syncTotalAssets() internal {
        uint256 actualBalance = aave.getUserSupplyBalance(address(this));
        if (actualBalance != totalAssets) {
            emit TotalAssetsSynced(totalAssets, actualBalance);
            totalAssets = actualBalance;
        }
    }

    function _findBestOpportunity()
        internal
        view
        returns (RebalanceOpportunity memory opp)
    {
        uint256 currentRate = aave.getSupplyAPY();
        uint256 currentBalance = aave.getUserSupplyBalance(address(this));
        if (currentBalance == 0) return opp;

        uint256 bestRate = 0;
        uint64 bestChain = 0;

        for (uint256 i = 0; i < monitoredChains.length; i++) {
            uint64 chain = monitoredChains[i];
            if (chain == currentChainSelector) continue;

            ChainYieldData memory data = chainYieldData[chain];
            if (!data.active) continue;
            if (block.timestamp > data.timestamp + 2 hours) continue;

            if (data.supplyRate > bestRate) {
                bestRate = data.supplyRate;
                bestChain = chain;
            }
        }

        if (bestChain == 0) return opp;

        uint256 delta = bestRate > currentRate ? bestRate - currentRate : 0;
        if (delta <= YIELD_DELTA_THRESHOLD) return opp;

        uint256 transferAmount = (currentBalance * MAX_TRANSFER_BPS) / 10000;
        if (transferAmount < MIN_TRANSFER_AMOUNT) return opp;

        uint256 estimatedBridgeCostUSDC = 1e6;
        // avoid truncation by multiplying first
        // dailyGain = (transferAmount * delta_annualized) / 365
        // delta in 1e18, transferAmount in 1e6 (USDC)
        uint256 dailyGainUSDC = (transferAmount * delta) /
            ((365 days * 1e18) / 1 seconds);
        // wait, delta is APY difference, let's say 2e16 (2%)
        // dailyGainUSDC = (transferAmount * delta) / (1e18 * 365)
        dailyGainUSDC = (transferAmount * delta) / (1e18 * 365);

        if (dailyGainUSDC == 0) return opp;
        if (estimatedBridgeCostUSDC > dailyGainUSDC * MAX_BREAKEVEN_DAYS)
            return opp;

        opp = RebalanceOpportunity({
            targetChain: bestChain,
            targetRate: bestRate,
            currentRate: currentRate,
            delta: delta,
            transferAmount: transferAmount,
            exists: true
        });
    }

    function setTrustedVault(
        uint64 chainSelector,
        address vault
    ) external onlyOwner {
        trustedVaults[chainSelector] = vault;
        emit TrustedVaultSet(chainSelector, vault);
    }

    function setAutomationForwarder(address forwarder) external onlyOwner {
        automationForwarder = forwarder;
    }

    function setCreOperator(address _creOperator) external onlyOwner {
        creOperator = _creOperator;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function fundLink(uint256 amount) external {
        linkToken.safeTransferFrom(msg.sender, address(this), amount);
        emit LinkFunded(msg.sender, amount);
    }

    function withdrawLink() external onlyOwner {
        uint256 balance = linkToken.balanceOf(address(this));
        linkToken.safeTransfer(owner, balance);
    }

    function syncTotalAssets() external onlyOwner {
        _syncTotalAssets();
    }

    function getUserBalance(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        uint256 actualBalance = aave.getUserSupplyBalance(address(this));
        return (userShares[user] * actualBalance) / totalShares;
    }

    function getCurrentOpportunity()
        external
        view
        returns (RebalanceOpportunity memory)
    {
        return _findBestOpportunity();
    }

    function cooldownRemaining() external view returns (uint256) {
        if (lastRebalanceTimestamp == 0) return 0;
        uint256 available = lastRebalanceTimestamp + REBALANCE_COOLDOWN;
        if (block.timestamp >= available) return 0;
        return available - block.timestamp;
    }

    function getAllYieldData()
        external
        view
        returns (
            uint64[] memory chains,
            uint256[] memory rates,
            uint256[] memory timestamps
        )
    {
        chains = monitoredChains;
        rates = new uint256[](monitoredChains.length);
        timestamps = new uint256[](monitoredChains.length);
        for (uint256 i = 0; i < monitoredChains.length; i++) {
            ChainYieldData memory data = chainYieldData[monitoredChains[i]];
            rates[i] = data.supplyRate;
            timestamps[i] = data.timestamp;
        }
    }

    function getLinkBalance() external view returns (uint256) {
        return linkToken.balanceOf(address(this));
    }
}
