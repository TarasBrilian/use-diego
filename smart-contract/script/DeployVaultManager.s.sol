// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/core/VaultManager.sol";

contract DeployVaultManager is Script {
    address constant CCIP_ROUTER = 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165;
    address constant LINK_TOKEN = 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E;
    uint64 constant CHAIN_SELECTOR = 3478487238524512106;

    address constant USDC_ADDRESS =
        address(0x6BA1b0802D4f483c9a884c5DaA48c35e1Da8737B);
    address constant AAVE_ADDRESS =
        address(0x33e5969EA863D298000D7E0414f6a3dc358c3dE3);
    address constant CRE_OPERATOR =
        address(0x3Ebf8ffC3F1517f9760dD2BfF36f934d19fa6cD8);

    function run() external {
        require(USDC_ADDRESS != address(0), "Set USDC_ADDRESS");
        require(AAVE_ADDRESS != address(0), "Set AAVE_ADDRESS");
        require(CRE_OPERATOR != address(0), "Set CRE_OPERATOR");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deploying VaultManager on Arbitrum Sepolia ===");
        console.log("Deployer       :", deployer);
        console.log("CCIP Router    :", CCIP_ROUTER);
        console.log("USDC           :", USDC_ADDRESS);
        console.log("MockAave       :", AAVE_ADDRESS);
        console.log("LINK Token     :", LINK_TOKEN);
        console.log("CRE Operator   :", CRE_OPERATOR);

        vm.startBroadcast(deployerPrivateKey);

        VaultManager vault = new VaultManager(
            CCIP_ROUTER,
            USDC_ADDRESS,
            AAVE_ADDRESS,
            LINK_TOKEN,
            CHAIN_SELECTOR,
            CRE_OPERATOR
        );

        console.log("VaultManager Arbitrum Sepolia:", address(vault));
        console.log("Simpan address ini untuk script 03_SetupArbitrum");

        vm.stopBroadcast();
    }
}
// forge script script/DeployVaultManager.s.sol:DeployVaultManager --rpc-url $RPC_URL_ARB --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
// forge script script/DeployVaultManager.s.sol:DeployVaultManager --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
