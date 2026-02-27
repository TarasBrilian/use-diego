// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/core/VaultManager.sol";

contract DeployVaultManager is Script {
    address constant CCIP_ROUTER = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;
    address constant LINK_TOKEN = 0xE4aB69C077896252FAFBD49EFD26B5D171A32410;
    uint64 constant CHAIN_SELECTOR = 10344971235874465080;

    address constant USDC_ADDRESS =
        address(0x7f8033ff9992730f133b75a571E6025ed34a639A);
    address constant AAVE_ADDRESS =
        address(0x61106cA6255a72096Ca417D0455f520eb5765219);
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
