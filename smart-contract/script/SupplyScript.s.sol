// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VaultManager} from "../src/core/VaultManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SupplyScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        // // --- ARBITRUM SEPOLIA ---
        // address vault = 0xe195954e128D7c65ba0632128B4F2d84EfE6A8D7;
        // address token = 0x6BA1b0802D4f483c9a884c5DaA48c35e1Da8737B;

        // --- BASE SEPOLIA ---
        address vault = 0x37c78AfB59a2D66811565Ca2431BFa395eD7666b;
        address token = 0x7f8033ff9992730f133b75a571E6025ed34a639A;

        uint256 amount = 10_000 * 1e6;

        vm.startBroadcast(privateKey);

        IERC20(token).approve(vault, amount);
        VaultManager(vault).deposit(amount);

        vm.stopBroadcast();
    }
}
