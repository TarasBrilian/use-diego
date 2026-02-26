// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockAAVEV3} from "../src/mocks/MockAAVEV3.sol";
import {MockUSDC} from "../src/mocks/Usdc.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";

contract DeployMockAAVE is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Tokens
        MockUSDC usdc = new MockUSDC();
        MockWETH weth = new MockWETH();

        console.log("MockUSDC deployed at:", address(usdc));
        console.log("MockWETH deployed at:", address(weth));

        // 2. Deploy Oracle
        // Assuming WETH is collateral and USDC is debt.
        // Price should be in debt token decimals (USDC has 6).
        // Let's say 1 WETH = 3000 USDC
        uint256 initialPrice = 3000 * 1e6;
        MockOracle oracle = new MockOracle(initialPrice);
        console.log("MockOracle deployed at:", address(oracle));

        // 3. Deploy MockAAVEV3
        // constructor(address _collateralToken, address _debtToken, address _oracle, uint256 _ltv)
        uint256 ltv = 0.8e18; // 80% LTV
        MockAAVEV3 aave = new MockAAVEV3(
            address(weth),
            address(usdc),
            address(oracle),
            ltv
        );
        console.log("MockAAVEV3 deployed at:", address(aave));

        // Initial setup: Provide some liquidity to the pool
        // We'll mint some USDC to the deployer and supply it
        address deployer = vm.addr(deployerPrivateKey);
        usdc.mint(); // This mocks 40,000 USDC to msg.sender

        usdc.approve(address(aave), type(uint256).max);
        aave.supply(10_000 * 1e6);

        console.log("MockAAVEV3 initialized with 10,000 USDC liquidity");

        vm.stopBroadcast();
    }
}
