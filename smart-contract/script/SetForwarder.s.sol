pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {VaultManager} from "../src/core/VaultManager.sol";

contract SetForwarder is Script {
    address constant VAULT = 0x526282Cc7a046204Eb8Ed3B52612Dd563a820242;
    address constant AUTOMATION_FORWARDER =
        0xAA74D968780E0B4B2797c896654c355482d6DD61;

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
// forge script script/SetForwarder.s.sol:SetForwarder --rpc-url $RPC_URL_BASE --broadcast
