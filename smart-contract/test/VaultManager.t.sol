// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {VaultManager} from "../src/core/VaultManager.sol";
import {MockAAVEV3} from "../src/mocks/MockAAVEV3.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Client} from "@chainlink/contracts-ccip/libraries/Client.sol";

// ─── Mock Contracts ───────────────────────────────────────────────────────────

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockLINK is ERC20 {
    constructor() ERC20("Mock LINK", "LINK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockOracle {
    uint256 private price;
    constructor(uint256 _price) {
        price = _price;
    }
    function getPrice() external view returns (uint256) {
        return price;
    }
    function setPrice(uint256 _price) external {
        price = _price;
    }
}

// Mock CCIP Router — simulate CCIP behavior tanpa actual cross-chain
contract MockCCIPRouter {
    uint256 public mockFee = 0.01 ether; // 0.01 LINK
    bytes32 public lastMessageId;
    address public lastReceiver;
    uint256 public sendCount;

    // Simpan message terakhir untuk verifikasi di test (hanya field penting)
    address public lastMessageSender;
    bytes public lastMessageData;
    Client.EVMTokenAmount[] public lastMessageTokenAmounts;

    function getFee(
        uint64,
        Client.EVM2AnyMessage memory
    ) external view returns (uint256) {
        return mockFee;
    }

    function ccipSend(
        uint64,
        Client.EVM2AnyMessage memory message
    ) external returns (bytes32) {
        lastMessageSender = msg.sender;
        lastMessageData = message.data;
        delete lastMessageTokenAmounts;
        for (uint256 i = 0; i < message.tokenAmounts.length; i++) {
            lastMessageTokenAmounts.push(message.tokenAmounts[i]);
        }
        lastReceiver = abi.decode(message.receiver, (address));

        lastMessageId = keccak256(abi.encode(block.timestamp, sendCount));
        sendCount++;

        // Ambil token dari sender (simulate CCIP token transfer)
        for (uint256 i = 0; i < message.tokenAmounts.length; i++) {
            IERC20(message.tokenAmounts[i].token).transferFrom(
                msg.sender,
                address(this),
                message.tokenAmounts[i].amount
            );
        }

        // Ambil fee LINK dari sender
        IERC20(address(bytes20(abi.encodePacked(message.feeToken))))
            .transferFrom(msg.sender, address(this), mockFee);

        return lastMessageId;
    }

    function setMockFee(uint256 _fee) external {
        mockFee = _fee;
    }
}

// ─── Base Test Contract ───────────────────────────────────────────────────────

contract VaultManagerTest is Test {
    // Contracts
    VaultManager public vault;
    MockAAVEV3 public mockAave;
    MockUSDC public usdc;
    MockLINK public link;
    MockOracle public oracle;
    MockCCIPRouter public ccipRouter;

    // Actors
    address public owner = makeAddr("owner");
    address public creOperator = makeAddr("creOperator");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public forwarder = makeAddr("forwarder");
    address public attacker = makeAddr("attacker");

    // Chain selectors
    uint64 public constant ARB_SELECTOR = 3478487238524512106;
    uint64 public constant BASE_SELECTOR = 10344971235874465080;

    // Trusted vault di chain lain (mock address)
    address public remoteVault = makeAddr("remoteVault");

    // Amount helpers
    uint256 public constant TEN_THOUSAND_USDC = 10_000e6;
    uint256 public constant ONE_THOUSAND_USDC = 1_000e6;
    uint256 public constant ONE_HUNDRED_USDC = 100e6;
    uint256 public constant LINK_AMOUNT = 10 ether;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mock tokens
        usdc = new MockUSDC();
        link = new MockLINK();
        oracle = new MockOracle(1e6); // 1 USDC per collateral unit

        // Deploy MockAave dengan USDC sebagai debt token
        // collateral token sama dengan debt token untuk simplicity
        mockAave = new MockAAVEV3(
            address(usdc),
            address(usdc),
            address(oracle),
            8e17 // 80% LTV
        );

        // Deploy mock CCIP router
        ccipRouter = new MockCCIPRouter();

        // Deploy VaultManager
        vault = new VaultManager(
            address(ccipRouter),
            address(usdc),
            address(mockAave),
            address(link),
            ARB_SELECTOR,
            creOperator
        );

        // Setup trusted vault
        vault.setTrustedVault(BASE_SELECTOR, remoteVault);

        // Set automation forwarder
        vault.setAutomationForwarder(forwarder);

        vm.stopPrank();

        // Fund semua actors dengan USDC dan LINK
        usdc.mint(user1, TEN_THOUSAND_USDC * 10);
        usdc.mint(user2, TEN_THOUSAND_USDC * 10);
        usdc.mint(attacker, TEN_THOUSAND_USDC);

        link.mint(owner, LINK_AMOUNT * 10);
        link.mint(user1, LINK_AMOUNT);
        link.mint(forwarder, LINK_AMOUNT);

        // Fund vault dengan LINK untuk bayar CCIP fee
        vm.startPrank(owner);
        link.approve(address(vault), LINK_AMOUNT * 5);
        vault.fundLink(LINK_AMOUNT * 5);
        vm.stopPrank();

        // Fund MockAave dengan USDC supaya bisa bayar interest/yield
        usdc.mint(address(mockAave), TEN_THOUSAND_USDC * 100);

        // Approve ccipRouter untuk ambil LINK (simulate fee payment)
        // ini diperlukan karena MockCCIPRouter transferFrom sender
        vm.prank(address(vault));
        link.approve(address(ccipRouter), type(uint256).max);
    }

    // ─── Helper Functions ─────────────────────────────────────────────────────

    function _depositAs(address user, uint256 amount) internal {
        vm.startPrank(user);
        usdc.approve(address(vault), amount);
        vault.deposit(amount);
        vm.stopPrank();
    }

    function _setYieldData(uint256 arbRate, uint256 baseRate) internal {
        vm.startPrank(creOperator);
        vault.updateYieldData(ARB_SELECTOR, arbRate);
        vault.updateYieldData(BASE_SELECTOR, baseRate);
        vm.stopPrank();
    }

    function _makeCheckUpkeepReturnTrue() internal {
        // Deposit supaya ada balance
        _depositAs(user1, TEN_THOUSAND_USDC);
        // Set yield: BASE lebih tinggi dari ARB dengan delta > 2%
        _setYieldData(8e16, 12e16); // ARB 8%, BASE 12%
    }

    // =========================================================================
    // DEPLOYMENT TESTS
    // =========================================================================

    function test_Deploy_CorrectInitialState() public view {
        assertEq(address(vault.usdc()), address(usdc));
        assertEq(address(vault.aave()), address(mockAave));
        assertEq(address(vault.linkToken()), address(link));
        assertEq(vault.currentChainSelector(), ARB_SELECTOR);
        assertEq(vault.owner(), owner);
        assertEq(vault.creOperator(), creOperator);
        assertEq(vault.totalShares(), 0);
        assertEq(vault.totalAssets(), 0);
        assertFalse(vault.paused());
    }

    function test_Deploy_TrustedVaultSet() public view {
        assertEq(vault.trustedVaults(BASE_SELECTOR), remoteVault);
    }

    // =========================================================================
    // DEPOSIT TESTS
    // =========================================================================

    function test_Deposit_FirstDeposit_SharesEqualAmount() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        assertEq(vault.userShares(user1), TEN_THOUSAND_USDC);
        assertEq(vault.totalShares(), TEN_THOUSAND_USDC);
        assertEq(vault.totalAssets(), TEN_THOUSAND_USDC);
    }

    function test_Deposit_EmitsEvent() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), TEN_THOUSAND_USDC);

        vm.expectEmit(true, false, false, true);
        emit VaultManager.Deposited(
            user1,
            TEN_THOUSAND_USDC,
            TEN_THOUSAND_USDC
        );

        vault.deposit(TEN_THOUSAND_USDC);
        vm.stopPrank();
    }

    function test_Deposit_SecondUser_ProportionalShares() public {
        // User1 deposit dulu
        _depositAs(user1, TEN_THOUSAND_USDC);

        // Simulasi yield terakumulasi di Aave
        vm.warp(block.timestamp + 365 days);
        mockAave.accrueInterest();

        // User2 deposit jumlah sama
        _depositAs(user2, TEN_THOUSAND_USDC);

        // User2 harus dapat shares lebih sedikit karena vault sudah punya yield
        assertLt(vault.userShares(user2), vault.userShares(user1));
    }

    function test_Deposit_ZeroAmount_Reverts() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), TEN_THOUSAND_USDC);
        vm.expectRevert(VaultManager.ZeroAmount.selector);
        vault.deposit(0);
        vm.stopPrank();
    }

    function test_Deposit_WhenPaused_Reverts() public {
        vm.prank(creOperator);
        vault.emergencyPause();

        vm.startPrank(user1);
        usdc.approve(address(vault), TEN_THOUSAND_USDC);
        vm.expectRevert(VaultManager.VaultPaused.selector);
        vault.deposit(TEN_THOUSAND_USDC);
        vm.stopPrank();
    }

    function test_Deposit_FundsGoToAave() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        uint256 aaveBalance = mockAave.getUserSupplyBalance(address(vault));
        assertApproxEqAbs(aaveBalance, TEN_THOUSAND_USDC, 1);
    }

    function test_Deposit_MultipleUsers() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        _depositAs(user2, TEN_THOUSAND_USDC);

        assertEq(vault.totalShares(), TEN_THOUSAND_USDC * 2);
        assertApproxEqAbs(vault.totalAssets(), TEN_THOUSAND_USDC * 2, 10);
    }

    // =========================================================================
    // WITHDRAW TESTS
    // =========================================================================

    function test_Withdraw_FullAmount() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = usdc.balanceOf(user1);

        vm.prank(user1);
        vault.withdraw(shares);

        assertEq(vault.userShares(user1), 0);
        assertApproxEqAbs(
            usdc.balanceOf(user1) - balanceBefore,
            TEN_THOUSAND_USDC,
            10 // tolerance untuk rounding
        );
    }

    function test_Withdraw_PartialAmount() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        uint256 totalShares = vault.userShares(user1);
        uint256 halfShares = totalShares / 2;

        vm.prank(user1);
        vault.withdraw(halfShares);

        assertEq(vault.userShares(user1), totalShares - halfShares);
    }

    function test_Withdraw_WithYield_ReceivesMore() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        // Simulasi 1 tahun yield
        vm.warp(block.timestamp + 365 days);
        mockAave.accrueInterest();

        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = usdc.balanceOf(user1);

        vm.prank(user1);
        vault.withdraw(shares);

        uint256 received = usdc.balanceOf(user1) - balanceBefore;
        assertGt(received, TEN_THOUSAND_USDC); // harus dapat lebih dari yang didepositkan
    }

    function test_Withdraw_ZeroShares_Reverts() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        vm.expectRevert(VaultManager.ZeroAmount.selector);
        vm.prank(user1);
        vault.withdraw(0);
    }

    function test_Withdraw_MoreThanOwned_Reverts() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        uint256 shares = vault.userShares(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                VaultManager.InsufficientBalance.selector,
                shares + 1,
                shares
            )
        );
        vm.prank(user1);
        vault.withdraw(shares + 1);
    }

    function test_Withdraw_EmitsEvent() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        uint256 shares = vault.userShares(user1);

        vm.expectEmit(true, false, false, false);
        emit VaultManager.Withdrawn(user1, 0, 0); // values tidak dicheck ketat

        vm.prank(user1);
        vault.withdraw(shares);
    }

    function test_Withdraw_TwoUsers_Independent() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        _depositAs(user2, ONE_THOUSAND_USDC);

        // User1 withdraw semua
        uint256 shares1 = vault.userShares(user1);
        vm.prank(user1);
        vault.withdraw(shares1);

        // User2 masih bisa withdraw
        uint256 user2Shares = vault.userShares(user2);
        assertGt(user2Shares, 0);

        vm.prank(user2);
        vault.withdraw(user2Shares);

        assertEq(vault.userShares(user2), 0);
    }

    // =========================================================================
    // CRE FUNCTIONS TESTS
    // =========================================================================

    function test_UpdateYieldData_OnlyCRE() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.updateYieldData(BASE_SELECTOR, 12e16);
    }

    function test_UpdateYieldData_StoresCorrectly() public {
        vm.prank(creOperator);
        vault.updateYieldData(BASE_SELECTOR, 12e16);

        (uint64[] memory chains, uint256[] memory rates, ) = vault
            .getAllYieldData();

        bool found = false;
        for (uint256 i = 0; i < chains.length; i++) {
            if (chains[i] == BASE_SELECTOR) {
                assertEq(rates[i], 12e16);
                found = true;
            }
        }
        assertTrue(found);
    }

    function test_UpdateYieldData_AddsToMonitoredChains() public {
        vm.prank(creOperator);
        vault.updateYieldData(BASE_SELECTOR, 12e16);

        // Cek monitoredChains berisi BASE_SELECTOR
        bool found = false;
        for (uint256 i = 0; ; i++) {
            try vault.monitoredChains(i) returns (uint64 chain) {
                if (chain == BASE_SELECTOR) {
                    found = true;
                    break;
                }
            } catch {
                break;
            }
        }
        assertTrue(found);
    }

    function test_UpdateYieldData_NoDuplicateInMonitoredChains() public {
        vm.startPrank(creOperator);
        vault.updateYieldData(BASE_SELECTOR, 12e16);
        vault.updateYieldData(BASE_SELECTOR, 10e16); // update lagi
        vm.stopPrank();

        uint256 count = 0;
        for (uint256 i = 0; ; i++) {
            try vault.monitoredChains(i) returns (uint64 chain) {
                if (chain == BASE_SELECTOR) count++;
            } catch {
                break;
            }
        }
        assertEq(count, 1); // tidak boleh duplikat
    }

    function test_EmergencyPause_OnlyCRE() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.emergencyPause();
    }

    function test_EmergencyPause_SetsPaused() public {
        vm.prank(creOperator);
        vault.emergencyPause();
        assertTrue(vault.paused());
    }

    function test_EmergencyUnpause_OnlyOwner() public {
        vm.prank(creOperator);
        vault.emergencyPause();

        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(creOperator);
        vault.emergencyUnpause();
    }

    function test_EmergencyUnpause_ClearsPaused() public {
        vm.prank(creOperator);
        vault.emergencyPause();

        vm.prank(owner);
        vault.emergencyUnpause();

        assertFalse(vault.paused());
    }

    // =========================================================================
    // CHECK UPKEEP TESTS
    // =========================================================================

    function test_CheckUpkeep_ReturnsFalse_WhenPaused() public {
        _makeCheckUpkeepReturnTrue();

        vm.prank(creOperator);
        vault.emergencyPause();

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenNoBalance() public {
        _setYieldData(8e16, 12e16);
        // tidak ada deposit

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenNoYieldData() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        // tidak ada updateYieldData

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenDeltaTooLow() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        // delta hanya 1%, di bawah threshold 2%
        _setYieldData(8e16, 9e16);

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenYieldDataStale() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        _setYieldData(8e16, 12e16);

        // Warp lebih dari 2 jam supaya data stale
        vm.warp(block.timestamp + 3 hours);

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenCooldownActive() public {
        _makeCheckUpkeepReturnTrue();

        // Simulasi cooldown aktif
        vm.warp(block.timestamp - 1); // set lastRebalance ke future via state manipulation
        vm.store(
            address(vault),
            bytes32(uint256(7)), // slot lastRebalanceTimestamp
            bytes32(block.timestamp + 1 hours)
        );

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_ReturnsTrue_WhenAllConditionsMet() public {
        _makeCheckUpkeepReturnTrue();

        (bool upkeepNeeded, bytes memory performData) = vault.checkUpkeep("");

        assertTrue(upkeepNeeded);
        assertTrue(performData.length > 0);
    }

    function test_CheckUpkeep_PerformData_ContainsCorrectChain() public {
        _makeCheckUpkeepReturnTrue();

        (, bytes memory performData) = vault.checkUpkeep("");
        (uint64 targetChain, , ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );

        assertEq(targetChain, BASE_SELECTOR);
    }

    function test_CheckUpkeep_PerformData_TransferAmountIs20Percent() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        _setYieldData(8e16, 12e16);

        (, bytes memory performData) = vault.checkUpkeep("");
        (, uint256 transferAmount, ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );

        uint256 expectedTransfer = (TEN_THOUSAND_USDC * 2000) / 10000; // 20%
        assertApproxEqAbs(transferAmount, expectedTransfer, 100);
    }

    // =========================================================================
    // PERFORM UPKEEP TESTS
    // =========================================================================

    function test_PerformUpkeep_OnlyForwarder() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.performUpkeep(performData);
    }

    function test_PerformUpkeep_OnlyOwnerWhenForwarderNotSet() public {
        // Deploy vault baru tanpa forwarder
        vm.prank(owner);
        VaultManager vaultNoForwarder = new VaultManager(
            address(ccipRouter),
            address(usdc),
            address(mockAave),
            address(link),
            ARB_SELECTOR,
            creOperator
        );

        // Owner bisa call performUpkeep kalau forwarder belum di-set
        // (ini untuk testing mode)
        assertEq(vaultNoForwarder.automationForwarder(), address(0));
    }

    function test_PerformUpkeep_SendsCCIPMessage() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        uint256 sendCountBefore = ccipRouter.sendCount();

        vm.prank(forwarder);
        vault.performUpkeep(performData);

        assertEq(ccipRouter.sendCount(), sendCountBefore + 1);
    }

    function test_PerformUpkeep_ReducesTotalAssets() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        (, uint256 transferAmount, ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );
        uint256 assetsBefore = vault.totalAssets();

        vm.prank(forwarder);
        vault.performUpkeep(performData);

        assertEq(vault.totalAssets(), assetsBefore - transferAmount);
    }

    function test_PerformUpkeep_SetsCooldown() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        vm.prank(forwarder);
        vault.performUpkeep(performData);

        assertGt(vault.cooldownRemaining(), 0);
        assertApproxEqAbs(vault.cooldownRemaining(), 24 hours, 5);
    }

    function test_PerformUpkeep_EmitsEvent() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");
        (, uint256 transferAmount, ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );

        vm.expectEmit(true, false, false, false);
        emit VaultManager.RebalanceTriggered(
            BASE_SELECTOR,
            transferAmount,
            bytes32(0)
        );

        vm.prank(forwarder);
        vault.performUpkeep(performData);
    }

    function test_PerformUpkeep_RevertsWhenCooldownActive() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        vm.prank(forwarder);
        vault.performUpkeep(performData);

        // Coba perform lagi — harus revert karena cooldown
        vm.expectRevert();
        vm.prank(forwarder);
        vault.performUpkeep(performData);
    }

    function test_PerformUpkeep_RevertsWhenPaused() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        vm.prank(creOperator);
        vault.emergencyPause();

        vm.expectRevert(VaultManager.VaultPaused.selector);
        vm.prank(forwarder);
        vault.performUpkeep(performData);
    }

    function test_PerformUpkeep_RevertsWhenYieldDeltaDropped() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        // Update yield data — BASE sekarang lebih rendah dari ARB
        _setYieldData(12e16, 8e16);

        vm.expectRevert();
        vm.prank(forwarder);
        vault.performUpkeep(performData);
    }

    // =========================================================================
    // CCIP RECEIVE TESTS
    // =========================================================================

    function test_CcipReceive_DepositsToAave() public {
        uint256 receiveAmount = ONE_THOUSAND_USDC;

        // Mint USDC ke vault untuk simulate incoming CCIP transfer
        usdc.mint(address(vault), receiveAmount);

        uint256 aaveBefore = mockAave.getUserSupplyBalance(address(vault));

        // Build CCIP message dari remoteVault di Base
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: receiveAmount
        });

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: bytes32(uint256(1)),
            sourceChainSelector: BASE_SELECTOR,
            sender: abi.encode(remoteVault),
            data: abi.encode(vault.ACTION_REBALANCE_IN(), receiveAmount),
            destTokenAmounts: tokenAmounts
        });

        // Call _ccipReceive via ccipReceive (public) dari router
        vm.prank(address(ccipRouter));
        vault.ccipReceive(message);

        uint256 aaveAfter = mockAave.getUserSupplyBalance(address(vault));
        assertApproxEqAbs(aaveAfter - aaveBefore, receiveAmount, 1);
    }

    function test_CcipReceive_UpdatesTotalAssets() public {
        uint256 receiveAmount = ONE_THOUSAND_USDC;
        usdc.mint(address(vault), receiveAmount);

        uint256 assetsBefore = vault.totalAssets();

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: receiveAmount
        });

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: bytes32(uint256(1)),
            sourceChainSelector: BASE_SELECTOR,
            sender: abi.encode(remoteVault),
            data: abi.encode(vault.ACTION_REBALANCE_IN(), receiveAmount),
            destTokenAmounts: tokenAmounts
        });

        vm.prank(address(ccipRouter));
        vault.ccipReceive(message);

        assertEq(vault.totalAssets(), assetsBefore + receiveAmount);
    }

    function test_CcipReceive_RejectsUntrustedSender() public {
        address fakeSender = makeAddr("fakeSender");
        usdc.mint(address(vault), ONE_THOUSAND_USDC);

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: ONE_THOUSAND_USDC
        });

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: bytes32(uint256(1)),
            sourceChainSelector: BASE_SELECTOR,
            sender: abi.encode(fakeSender), // bukan remoteVault
            data: abi.encode(vault.ACTION_REBALANCE_IN(), ONE_THOUSAND_USDC),
            destTokenAmounts: tokenAmounts
        });

        vm.expectRevert(
            abi.encodeWithSelector(
                VaultManager.InvalidSender.selector,
                fakeSender
            )
        );
        vm.prank(address(ccipRouter));
        vault.ccipReceive(message);
    }

    function test_CcipReceive_RejectsUnknownChain() public {
        uint64 unknownChain = 9999;
        usdc.mint(address(vault), ONE_THOUSAND_USDC);

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: ONE_THOUSAND_USDC
        });

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: bytes32(uint256(1)),
            sourceChainSelector: unknownChain,
            sender: abi.encode(remoteVault),
            data: abi.encode(vault.ACTION_REBALANCE_IN(), ONE_THOUSAND_USDC),
            destTokenAmounts: tokenAmounts
        });

        vm.expectRevert(
            abi.encodeWithSelector(
                VaultManager.InvalidChain.selector,
                unknownChain
            )
        );
        vm.prank(address(ccipRouter));
        vault.ccipReceive(message);
    }

    function test_CcipReceive_WhenPaused_Reverts() public {
        vm.prank(creOperator);
        vault.emergencyPause();

        usdc.mint(address(vault), ONE_THOUSAND_USDC);

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(usdc),
            amount: ONE_THOUSAND_USDC
        });

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: bytes32(uint256(1)),
            sourceChainSelector: BASE_SELECTOR,
            sender: abi.encode(remoteVault),
            data: abi.encode(vault.ACTION_REBALANCE_IN(), ONE_THOUSAND_USDC),
            destTokenAmounts: tokenAmounts
        });

        vm.expectRevert(VaultManager.VaultPaused.selector);
        vm.prank(address(ccipRouter));
        vault.ccipReceive(message);
    }

    // =========================================================================
    // ADMIN FUNCTIONS TESTS
    // =========================================================================

    function test_SetTrustedVault_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.setTrustedVault(BASE_SELECTOR, attacker);
    }

    function test_SetTrustedVault_UpdatesMapping() public {
        address newVault = makeAddr("newVault");
        vm.prank(owner);
        vault.setTrustedVault(BASE_SELECTOR, newVault);
        assertEq(vault.trustedVaults(BASE_SELECTOR), newVault);
    }

    function test_SetAutomationForwarder_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.setAutomationForwarder(attacker);
    }

    function test_SetCreOperator_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.setCreOperator(attacker);
    }

    function test_TransferOwnership_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.transferOwnership(attacker);
    }

    function test_TransferOwnership_UpdatesOwner() public {
        address newOwner = makeAddr("newOwner");
        vm.prank(owner);
        vault.transferOwnership(newOwner);
        assertEq(vault.owner(), newOwner);
    }

    function test_WithdrawLink_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.withdrawLink();
    }

    function test_WithdrawLink_TransfersToOwner() public {
        uint256 linkBefore = link.balanceOf(owner);

        vm.prank(owner);
        vault.withdrawLink();

        assertGt(link.balanceOf(owner), linkBefore);
    }

    function test_SyncTotalAssets_OnlyOwner() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.syncTotalAssets();
    }

    function test_SyncTotalAssets_UpdatesFromAave() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        // Warp supaya interest terakumulasi
        vm.warp(block.timestamp + 365 days);
        mockAave.accrueInterest();

        uint256 aaveBalance = mockAave.getUserSupplyBalance(address(vault));
        uint256 assetsBefore = vault.totalAssets();

        vm.prank(owner);
        vault.syncTotalAssets();

        assertEq(vault.totalAssets(), aaveBalance);
        assertGt(vault.totalAssets(), assetsBefore);
    }

    // =========================================================================
    // VIEW FUNCTIONS TESTS
    // =========================================================================

    function test_GetUserBalance_ReflectsYield() public {
        _depositAs(user1, TEN_THOUSAND_USDC);

        uint256 balanceBefore = vault.getUserBalance(user1);

        vm.warp(block.timestamp + 365 days);
        mockAave.accrueInterest();

        uint256 balanceAfter = vault.getUserBalance(user1);
        assertGt(balanceAfter, balanceBefore);
    }

    function test_GetUserBalance_ZeroWhenNoDeposit() public view {
        assertEq(vault.getUserBalance(user1), 0);
    }

    function test_CooldownRemaining_ZeroInitially() public view {
        assertEq(vault.cooldownRemaining(), 0);
    }

    function test_GetLinkBalance_ReturnsCorrect() public view {
        assertEq(vault.getLinkBalance(), LINK_AMOUNT * 5);
    }

    function test_GetCurrentOpportunity_ExistsWhenConditionsMet() public {
        _makeCheckUpkeepReturnTrue();

        VaultManager.RebalanceOpportunity memory opp = vault
            .getCurrentOpportunity();

        assertTrue(opp.exists);
        assertEq(opp.targetChain, BASE_SELECTOR);
        assertEq(opp.targetRate, 12e16);
        assertEq(opp.currentRate, 8e16);
    }

    function test_GetCurrentOpportunity_NotExistsWhenNoBalance() public {
        _setYieldData(8e16, 12e16);

        VaultManager.RebalanceOpportunity memory opp = vault
            .getCurrentOpportunity();
        assertFalse(opp.exists);
    }

    // =========================================================================
    // SECURITY TESTS
    // =========================================================================

    function test_Security_AttackerCannotDeposit_WithoutApproval() public {
        vm.expectRevert();
        vm.prank(attacker);
        vault.deposit(TEN_THOUSAND_USDC);
    }

    function test_Security_AttackerCannotWithdrawOthersShares() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        uint256 user1Shares = vault.userShares(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                VaultManager.InsufficientBalance.selector,
                user1Shares,
                0 // attacker punya 0 shares
            )
        );
        vm.prank(attacker);
        vault.withdraw(user1Shares);
    }

    function test_Security_AttackerCannotCallPerformUpkeep() public {
        _makeCheckUpkeepReturnTrue();
        (, bytes memory performData) = vault.checkUpkeep("");

        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.performUpkeep(performData);
    }

    function test_Security_AttackerCannotUpdateYieldData() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.updateYieldData(BASE_SELECTOR, 99e16);
    }

    function test_Security_AttackerCannotPause() public {
        vm.expectRevert(VaultManager.Unauthorized.selector);
        vm.prank(attacker);
        vault.emergencyPause();
    }

    // =========================================================================
    // BREAKEVEN CALCULATION TEST
    // Ini test yang validasi fix dari bug yang kita temukan
    // =========================================================================

    function test_Breakeven_DoesNotTruncateToZero() public {
        // Deposit 10k USDC
        _depositAs(user1, TEN_THOUSAND_USDC);

        // Delta 4%: BASE 12%, ARB 8%
        // transferAmount = 10000 * 20% = 2000 USDC
        // dailyGain harus > 0 supaya tidak false positive
        _setYieldData(8e16, 12e16);

        // checkUpkeep harus return true, bukan false karena dailyGain = 0
        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertTrue(
            upkeepNeeded,
            "checkUpkeep harus true, breakeven calculation tidak boleh truncate ke 0"
        );
    }

    function test_Breakeven_SmallDelta_StillWorks() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        // Delta tepat di atas threshold: 2.1%
        _setYieldData(8e16, 10.1e16);

        (bool upkeepNeeded, ) = vault.checkUpkeep("");
        assertTrue(upkeepNeeded);
    }

    // =========================================================================
    // INTEGRATION TEST — full rebalancing flow
    // =========================================================================

    function test_Integration_FullRebalanceFlow() public {
        // 1. User deposit
        _depositAs(user1, TEN_THOUSAND_USDC);
        assertApproxEqAbs(
            mockAave.getUserSupplyBalance(address(vault)),
            TEN_THOUSAND_USDC,
            1
        );

        // 2. CRE update yield data
        _setYieldData(8e16, 12e16);

        // 3. checkUpkeep return true
        (bool upkeepNeeded, bytes memory performData) = vault.checkUpkeep("");
        assertTrue(upkeepNeeded);

        // 4. Automation trigger performUpkeep
        uint256 assetsBefore = vault.totalAssets();
        (, uint256 transferAmount, ) = abi.decode(
            performData,
            (uint64, uint256, uint256)
        );

        vm.prank(forwarder);
        vault.performUpkeep(performData);

        // 5. Verify state setelah rebalance
        assertEq(vault.totalAssets(), assetsBefore - transferAmount);
        assertGt(vault.cooldownRemaining(), 0);
        assertEq(ccipRouter.sendCount(), 1);
        assertEq(ccipRouter.lastReceiver(), remoteVault);

        // 6. checkUpkeep return false karena cooldown
        (bool upkeepNeeded2, ) = vault.checkUpkeep("");
        assertFalse(upkeepNeeded2);

        // 7. User masih bisa withdraw sisa balance
        uint256 shares = vault.userShares(user1);
        assertGt(shares, 0);

        uint256 balanceBefore = usdc.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(shares);
        assertGt(usdc.balanceOf(user1), balanceBefore);
    }

    function test_Integration_YieldAccrual_SharesValueIncrease() public {
        _depositAs(user1, TEN_THOUSAND_USDC);
        _depositAs(user2, TEN_THOUSAND_USDC);

        uint256 user1BalanceBefore = vault.getUserBalance(user1);
        uint256 user2BalanceBefore = vault.getUserBalance(user2);

        // 1 tahun berlalu
        vm.warp(block.timestamp + 365 days);
        mockAave.accrueInterest();

        uint256 user1BalanceAfter = vault.getUserBalance(user1);
        uint256 user2BalanceAfter = vault.getUserBalance(user2);

        // Kedua user dapat yield
        assertGt(user1BalanceAfter, user1BalanceBefore);
        assertGt(user2BalanceAfter, user2BalanceBefore);

        // Yield proporsional — sama karena deposit sama
        assertApproxEqAbs(user1BalanceAfter, user2BalanceAfter, 10);
    }
}
