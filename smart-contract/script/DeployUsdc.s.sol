// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockUSDC} from "../src/mocks/Usdc.sol";

contract DeployUsdc is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        vm.stopBroadcast();
    }
}
// forge script script/DeployUsdc.s.sol --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
