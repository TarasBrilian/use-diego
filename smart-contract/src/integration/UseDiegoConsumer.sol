// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReceiverTemplate} from "./ReceiverTemplate.sol";

interface IVaultManager {
    function updateYieldData(uint64 chainSelector, uint256 supplyRate) external;
}

contract UseDiegoConsumer is ReceiverTemplate {
    IVaultManager public vaultManager;

    struct YieldReport {
        uint64 chainSelector;
        uint256 supplyRate;
    }

    event VaultManagerUpdated(address indexed newVaultManager);
    event YieldDataReceived(uint64 indexed chainSelector, uint256 supplyRate);

    constructor(
        address _forwarder,
        address _vaultManager
    ) ReceiverTemplate(_forwarder) {
        vaultManager = IVaultManager(_vaultManager);
    }

    function setVaultManager(address _vaultManager) external onlyOwner {
        vaultManager = IVaultManager(_vaultManager);
        emit VaultManagerUpdated(_vaultManager);
    }

    function _processReport(bytes calldata report) internal override {
        YieldReport memory yieldReport = abi.decode(report, (YieldReport));

        emit YieldDataReceived(
            yieldReport.chainSelector,
            yieldReport.supplyRate
        );

        vaultManager.updateYieldData(
            yieldReport.chainSelector,
            yieldReport.supplyRate
        );
    }
}
