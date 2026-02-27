export const vaultManager = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_ccipRouter",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_usdc",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_aave",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_linkToken",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_currentChainSelector",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "_creOperator",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ACTION_REBALANCE_IN",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "BRIDGE_COST_LIMIT",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_BREAKEVEN_DAYS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_TRANSFER_BPS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MIN_TRANSFER_AMOUNT",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "REBALANCE_COOLDOWN",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "YIELD_DELTA_THRESHOLD",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "aave",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IMockAave"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "automationForwarder",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "ccipReceive",
        "inputs": [
            {
                "name": "message",
                "type": "tuple",
                "internalType": "struct Client.Any2EVMMessage",
                "components": [
                    {
                        "name": "messageId",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "sourceChainSelector",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "sender",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "destTokenAmounts",
                        "type": "tuple[]",
                        "internalType": "struct Client.EVMTokenAmount[]",
                        "components": [
                            {
                                "name": "token",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "amount",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ccipRouter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IRouterClient"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "chainYieldData",
        "inputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [
            {
                "name": "supplyRate",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "timestamp",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "active",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "checkUpkeep",
        "inputs": [
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "upkeepNeeded",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "performData",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "cooldownRemaining",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "creOperator",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "currentChainSelector",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "deposit",
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "emergencyPause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "emergencyUnpause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "fundLink",
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getAllYieldData",
        "inputs": [],
        "outputs": [
            {
                "name": "chains",
                "type": "uint64[]",
                "internalType": "uint64[]"
            },
            {
                "name": "rates",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            {
                "name": "timestamps",
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getCurrentOpportunity",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct VaultManager.RebalanceOpportunity",
                "components": [
                    {
                        "name": "targetChain",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "targetRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "currentRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "delta",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "transferAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "exists",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getLinkBalance",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getRouter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getUserBalance",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastRebalanceTimestamp",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "linkToken",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IERC20"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "monitoredChains",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "performUpkeep",
        "inputs": [
            {
                "name": "performData",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setAutomationForwarder",
        "inputs": [
            {
                "name": "forwarder",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setCreOperator",
        "inputs": [
            {
                "name": "_creOperator",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setTrustedVault",
        "inputs": [
            {
                "name": "chainSelector",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "vault",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
            {
                "name": "interfaceId",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "syncTotalAssets",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "totalAssets",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalShares",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "trustedVaults",
        "inputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "updateYieldData",
        "inputs": [
            {
                "name": "chainSelector",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "supplyRate",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "usdc",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IERC20"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "userShares",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "shares",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawLink",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "Deposited",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "sharesIssued",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "EmergencyPaused",
        "inputs": [
            {
                "name": "triggeredBy",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "EmergencyUnpaused",
        "inputs": [
            {
                "name": "triggeredBy",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "LinkFunded",
        "inputs": [
            {
                "name": "funder",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RebalanceReceived",
        "inputs": [
            {
                "name": "sourceChain",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RebalanceTriggered",
        "inputs": [
            {
                "name": "targetChain",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "messageId",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TotalAssetsSynced",
        "inputs": [
            {
                "name": "oldValue",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "newValue",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TrustedVaultSet",
        "inputs": [
            {
                "name": "chainSelector",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "vault",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdrawn",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "sharesBurned",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "YieldDataUpdated",
        "inputs": [
            {
                "name": "chainSelector",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "supplyRate",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "timestamp",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "BridgeCostTooHigh",
        "inputs": [
            {
                "name": "cost",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "limit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "CooldownActive",
        "inputs": [
            {
                "name": "availableAt",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "InsufficientBalance",
        "inputs": [
            {
                "name": "requested",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "available",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "InvalidChain",
        "inputs": [
            {
                "name": "chainSelector",
                "type": "uint64",
                "internalType": "uint64"
            }
        ]
    },
    {
        "type": "error",
        "name": "InvalidRouter",
        "inputs": [
            {
                "name": "router",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "InvalidSender",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "TransferAmountTooLow",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Unauthorized",
        "inputs": []
    },
    {
        "type": "error",
        "name": "VaultPaused",
        "inputs": []
    },
    {
        "type": "error",
        "name": "YieldDeltaTooLow",
        "inputs": [
            {
                "name": "delta",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "threshold",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ZeroAmount",
        "inputs": []
    }
] as const