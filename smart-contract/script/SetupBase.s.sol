// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/core/VaultManager.sol";

interface ISimpleERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SetupBaseSepolia is Script {
    address VAULT_ARB = address(vm.envAddress("VAULT_MANAGER_ADDRESS_ARB"));
    address VAULT_BASE = address(vm.envAddress("VAULT_MANAGER_ADDRESS_BASE"));
    address constant LINK_TOKEN = 0xE4aB69C077896252FAFBD49EFD26B5D171A32410;

    uint64 constant ARB_SELECTOR = 3478487238524512106;
    uint64 constant BASE_SELECTOR = 10344971235874465080;
    uint256 constant LINK_FUND_AMOUNT = 0.1 ether;

    uint256 constant ARB_INITIAL_APY = 8e16; // 8%
    uint256 constant BASE_INITIAL_APY = 3e16; // 3%

    function run() external {
        require(VAULT_ARB != address(0), "Set VAULT_ARB");
        require(VAULT_BASE != address(0), "Set VAULT_BASE");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Setup VaultManager Base Sepolia ===");

        vm.startBroadcast(deployerPrivateKey);

        VaultManager vault = VaultManager(VAULT_BASE);

        vault.setTrustedVault(ARB_SELECTOR, VAULT_ARB);
        console.log("setTrustedVault Arbitrum ->", VAULT_ARB);

        ISimpleERC20(LINK_TOKEN).approve(VAULT_BASE, LINK_FUND_AMOUNT);
        vault.fundLink(LINK_FUND_AMOUNT);
        console.log("fundLink: 2 LINK");

        vault.updateYieldData(ARB_SELECTOR, ARB_INITIAL_APY);
        vault.updateYieldData(BASE_SELECTOR, BASE_INITIAL_APY);
        console.log("updateYieldData: ARB 8%, BASE 3%");

        console.log("Setup Base selesai.");
        console.log(
            "Next: register di automation.chain.link, lalu jalankan 05 dan 06"
        );

        vm.stopBroadcast();
    }
}
// forge script script/SetupBase.s.sol:SetupBaseSepolia --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
