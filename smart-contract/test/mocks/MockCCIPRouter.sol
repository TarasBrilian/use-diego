// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {
    IRouterClient
} from "@chainlink/contracts-ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/libraries/Client.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract MockCCIPRouter is IRouterClient {
    uint256 public fee = 1e18; // Default fee

    function setFee(uint256 _fee) external {
        fee = _fee;
    }

    function getFee(
        uint64,
        Client.EVM2AnyMessage memory
    ) external view returns (uint256) {
        return fee;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage calldata message
    ) external payable returns (bytes32) {
        if (message.feeToken != address(0)) {
            IERC20(message.feeToken).transferFrom(
                msg.sender,
                address(this),
                fee
            );
        }

        // Mock transfer of tokens
        for (uint256 i = 0; i < message.tokenAmounts.length; i++) {
            IERC20(message.tokenAmounts[i].token).transferFrom(
                msg.sender,
                address(this),
                message.tokenAmounts[i].amount
            );
        }

        return
            keccak256(
                abi.encode(
                    destinationChainSelector,
                    message.data,
                    block.timestamp
                )
            );
    }

    function isChainSupported(uint64) external pure returns (bool) {
        return true;
    }

    function getSupportedTokens(
        uint64
    ) external pure returns (address[] memory) {
        return new address[](0);
    }
}
