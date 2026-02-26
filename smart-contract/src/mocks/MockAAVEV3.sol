// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {
    IERC20Metadata
} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {
    SafeERC20
} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

interface IOracle {
    function getPrice() external view returns (uint256);
}

contract MockAAVEV3 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ZeroAmount();
    error InsufficientShares();
    error InsufficientLiquidity();
    error InsufficientCollateral();
    error LTVExceedMaxAmount();
    error InvalidOracle();
    error FlashLoanFailed(address token, uint256 amount);
    error Unauthorized();

    uint256 public totalSupplyShares;
    uint256 public totalSupplyAssets;
    uint256 public totalBorrowShares;
    uint256 public totalBorrowAssets;
    uint256 public lastAccrued;

    uint256 public borrowRate;
    uint256 public supplyRate;

    uint256 public ltv;
    address public debtToken;
    address public collateralToken;
    address public oracle;
    address public owner;

    event Supply(address user, uint256 amount, uint256 shares);
    event Withdraw(address user, uint256 amount, uint256 shares);
    event SupplyCollateral(address user, uint256 amount);
    event Borrow(address user, uint256 amount, uint256 shares);
    event Repay(address user, uint256 amount, uint256 shares);
    event RateUpdated(uint256 newBorrowRate, uint256 newSupplyRate);

    mapping(address => uint256) public userSupplyShares;
    mapping(address => uint256) public userBorrowShares;
    mapping(address => uint256) public userCollaterals;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(
        address _collateralToken,
        address _debtToken,
        address _oracle,
        uint256 _ltv
    ) {
        collateralToken = _collateralToken;
        debtToken = _debtToken;
        oracle = _oracle;
        if (oracle == address(0)) revert InvalidOracle();
        if (_ltv > 1e18) revert LTVExceedMaxAmount();
        ltv = _ltv;
        borrowRate = 1e17;
        supplyRate = 8e16;
        lastAccrued = block.timestamp;
        owner = msg.sender;
    }

    function setRates(
        uint256 _borrowRate,
        uint256 _supplyRate
    ) external onlyOwner {
        _accrueInterest();
        borrowRate = _borrowRate;
        supplyRate = _supplyRate;
        emit RateUpdated(_borrowRate, _supplyRate);
    }

    function getSupplyAPY() external view returns (uint256) {
        return supplyRate;
    }

    function getUtilizationRate() external view returns (uint256) {
        if (totalSupplyAssets == 0) return 0;
        return (totalBorrowAssets * 1e18) / totalSupplyAssets;
    }

    function getPoolInfo()
        external
        view
        returns (
            uint256 _totalSupply,
            uint256 _totalBorrow,
            uint256 _supplyRate,
            uint256 _borrowRate,
            uint256 _utilization
        )
    {
        _totalSupply = totalSupplyAssets;
        _totalBorrow = totalBorrowAssets;
        _supplyRate = supplyRate;
        _borrowRate = borrowRate;
        _utilization = totalSupplyAssets == 0
            ? 0
            : (totalBorrowAssets * 1e18) / totalSupplyAssets;
    }

    function supply(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _accrueInterest();

        IERC20(debtToken).safeTransferFrom(msg.sender, address(this), amount);

        uint256 shares = totalSupplyShares == 0
            ? amount
            : (amount * totalSupplyShares) / totalSupplyAssets;

        userSupplyShares[msg.sender] += shares;
        totalSupplyShares += shares;
        totalSupplyAssets += amount;

        emit Supply(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (shares > userSupplyShares[msg.sender]) revert InsufficientShares();

        _accrueInterest();

        uint256 amount = (shares * totalSupplyAssets) / totalSupplyShares;

        userSupplyShares[msg.sender] -= shares;
        totalSupplyAssets -= amount;
        totalSupplyShares -= shares;

        if (totalSupplyAssets < totalBorrowAssets)
            revert InsufficientLiquidity();

        IERC20(debtToken).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount, shares);
    }

    function withdrawByAmount(
        uint256 amount
    ) external nonReentrant returns (uint256 sharesBurned) {
        if (amount == 0) revert ZeroAmount();
        _accrueInterest();

        sharesBurned = (amount * totalSupplyShares) / totalSupplyAssets;
        if (sharesBurned > userSupplyShares[msg.sender])
            revert InsufficientShares();

        userSupplyShares[msg.sender] -= sharesBurned;
        totalSupplyAssets -= amount;
        totalSupplyShares -= sharesBurned;

        if (totalSupplyAssets < totalBorrowAssets)
            revert InsufficientLiquidity();

        IERC20(debtToken).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount, sharesBurned);
    }

    function borrow(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _accrueInterest();

        _isHealthy(msg.sender, amount);

        if (totalBorrowAssets + amount > totalSupplyAssets)
            revert InsufficientLiquidity();

        uint256 shares = totalBorrowShares == 0
            ? amount
            : (amount * totalBorrowShares) / totalBorrowAssets;

        userBorrowShares[msg.sender] += shares;
        totalBorrowShares += shares;
        totalBorrowAssets += amount;

        IERC20(debtToken).safeTransfer(msg.sender, amount);

        emit Borrow(msg.sender, amount, shares);
    }

    function repay(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (shares > userBorrowShares[msg.sender]) revert InsufficientShares();

        _accrueInterest();

        uint256 borrowAmount = (shares * totalBorrowAssets) / totalBorrowShares;

        userBorrowShares[msg.sender] -= shares;
        totalBorrowShares -= shares;
        totalBorrowAssets -= borrowAmount;

        IERC20(debtToken).safeTransferFrom(
            msg.sender,
            address(this),
            borrowAmount
        );

        emit Repay(msg.sender, borrowAmount, shares);
    }

    function supplyCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _accrueInterest();

        IERC20(collateralToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        userCollaterals[msg.sender] += amount;

        emit SupplyCollateral(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > userCollaterals[msg.sender])
            revert InsufficientCollateral();

        _accrueInterest();

        userCollaterals[msg.sender] -= amount;

        _isHealthy(msg.sender, 0);

        IERC20(collateralToken).safeTransfer(msg.sender, amount);
    }

    function flashLoan(
        address token,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        uint256 balanceBefore = IERC20(token).balanceOf(address(this));

        IERC20(token).safeTransfer(msg.sender, amount);

        (bool success, ) = address(msg.sender).call(data);
        if (!success) revert FlashLoanFailed(token, amount);

        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        if (balanceAfter < balanceBefore) revert FlashLoanFailed(token, amount);
    }

    function _accrueInterest() internal {
        uint256 elapsed = block.timestamp - lastAccrued;
        if (elapsed == 0) return;

        uint256 borrowInterest = (totalBorrowAssets * borrowRate * elapsed) /
            (1e18 * 365 days);

        uint256 supplyInterest = (totalSupplyAssets * supplyRate * elapsed) /
            (1e18 * 365 days);

        totalBorrowAssets += borrowInterest;
        totalSupplyAssets += supplyInterest;
        lastAccrued = block.timestamp;
    }

    function accrueInterest() external nonReentrant {
        _accrueInterest();
    }

    function _isHealthy(address user, uint256 additionalBorrow) internal view {
        if (userBorrowShares[user] == 0 && additionalBorrow == 0) return;

        uint256 collateralPrice = IOracle(oracle).getPrice();
        uint256 collateralDecimals = 10 **
            IERC20Metadata(collateralToken).decimals();

        uint256 currentBorrow = totalBorrowShares == 0
            ? 0
            : (userBorrowShares[user] * totalBorrowAssets) / totalBorrowShares;

        uint256 totalBorrowForUser = currentBorrow + additionalBorrow;

        uint256 collateralValue = (userCollaterals[user] * collateralPrice) /
            collateralDecimals;
        uint256 maxBorrow = (collateralValue * ltv) / 1e18;

        if (totalBorrowForUser > maxBorrow) revert InsufficientCollateral();
    }

    function getUserSupplyBalance(
        address user
    ) external view returns (uint256) {
        if (totalSupplyShares == 0) return 0;
        return (userSupplyShares[user] * totalSupplyAssets) / totalSupplyShares;
    }

    function getUserBorrowBalance(
        address user
    ) external view returns (uint256) {
        if (totalBorrowShares == 0) return 0;
        return (userBorrowShares[user] * totalBorrowAssets) / totalBorrowShares;
    }
}
