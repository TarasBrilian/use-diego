// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockAAVEV3} from "../src/mocks/MockAAVEV3.sol";

contract DeployMockAAVE is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        uint256 ltv = 0.8e18;
        MockAAVEV3 aave = new MockAAVEV3(
            address(0xF5C980d2abdB533038f361D45167655c24B75185), //WETH
            address(0x7f8033ff9992730f133b75a571E6025ed34a639A), //USDC
            address(0x81E6d6CE1a3840d7F98f23aACC30ad9Fc5D5f607), //Oracle
            ltv
        );
        console.log("MockAAVEV3 deployed at:", address(aave));

        vm.stopBroadcast();
    }
}
// forge script script/DeployMockAAVE.s.sol --rpc-url $RPC_URL_BASE --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
