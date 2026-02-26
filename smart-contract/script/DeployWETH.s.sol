// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";

contract DeployWETH is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        MockWETH weth = new MockWETH();
        console.log("MockWETH deployed at:", address(weth));

        vm.stopBroadcast();
    }
}
// forge script script/DeployWETH.s.sol --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
