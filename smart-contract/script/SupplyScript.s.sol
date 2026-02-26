// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {MockAAVEV3} from "../src/mocks/MockAAVEV3.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SupplyScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address lending = 0x61106cA6255a72096Ca417D0455f520eb5765219;
        address token = 0x7f8033ff9992730f133b75a571E6025ed34a639A;

        uint256 amount = 10_000 * 1e6;

        vm.startBroadcast(privateKey);

        IERC20(token).approve(lending, amount);
        MockAAVEV3(lending).supply(amount);

        vm.stopBroadcast();
    }
}
