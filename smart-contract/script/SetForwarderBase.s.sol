pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {VaultManager} from "../src/core/VaultManager.sol";

contract SetForwarder is Script {
    address VAULT = vm.envAddress("VAULT_MANAGER_ADDRESS_BASE");
    address AUTOMATION_FORWARDER =
        vm.envAddress("AUTOMATION_FORWARDER_ADDRESS_BASE");

    function run() external {
        require(VAULT != address(0), "Set VAULT");
        require(AUTOMATION_FORWARDER != address(0), "Set AUTOMATION_FORWARDER");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        VaultManager(VAULT).setAutomationForwarder(AUTOMATION_FORWARDER);

        console.log("Forwarder set pada VaultManager :", AUTOMATION_FORWARDER);
        console.log(
            "performUpkeep sekarang hanya bisa dipanggil Chainlink Automation."
        );

        vm.stopBroadcast();
    }
}
// forge script script/SetForwarderBase.s.sol:SetForwarder --rpc-url $RPC_URL_BASE --broadcast
