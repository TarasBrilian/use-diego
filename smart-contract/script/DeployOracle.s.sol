// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";

contract DeployOracle is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        uint256 initialPrice = 3000 * 1e6;
        MockOracle oracle = new MockOracle(initialPrice);
        console.log("MockOracle deployed at:", address(oracle));

        vm.stopBroadcast();
    }
}
// forge script script/DeployOracle.s.sol --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
