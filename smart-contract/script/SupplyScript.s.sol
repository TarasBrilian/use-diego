// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VaultManager} from "../src/core/VaultManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SupplyScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        // // --- BASE SEPOLIA ---
        address vault = vm.envAddress("VAULT_MANAGER_ADDRESS_BASE");
        address token = vm.envAddress("USDC_ADDRESS_BASE");

        uint256 amount = 1 * 1e18;

        vm.startBroadcast(privateKey);

        IERC20(token).approve(vault, amount);
        VaultManager(vault).deposit(amount);

        vm.stopBroadcast();
    }
}
// forge script script/SupplyScript.s.sol:SupplyScript --rpc-url $RPC_URL_BASE
