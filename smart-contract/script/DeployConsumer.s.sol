// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {UseDiegoConsumer} from "../src/integration/UseDiegoConsumer.sol";

contract DeployConsumer is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        UseDiegoConsumer consumer = new UseDiegoConsumer(
            vm.envAddress("FORWARDER_ADDRESS_BASE"),
            vm.envAddress("VAULT_MANAGER_ADDRESS_ARB")
        );
        console.log("UseDiegoConsumer deployed at:", address(consumer));

        vm.stopBroadcast();
    }
}
// forge script script/DeployConsumer.s.sol:DeployConsumer --rpc-url $RPC_URL_ARB --broadcast
