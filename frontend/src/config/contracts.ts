export const vaultManagerAbi = [
    {
        type: "function",
        name: "totalAssets",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalShares",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "userShares",
        inputs: [{ name: "", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getCurrentOpportunity",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct VaultManager.RebalanceOpportunity",
                components: [
                    { name: "targetChain", type: "uint64", internalType: "uint64" },
                    { name: "targetRate", type: "uint256", internalType: "uint256" },
                    { name: "currentRate", type: "uint256", internalType: "uint256" },
                    { name: "delta", type: "uint256", internalType: "uint256" },
                    { name: "transferAmount", type: "uint256", internalType: "uint256" },
                    { name: "exists", type: "bool", internalType: "bool" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "chainYieldData",
        inputs: [{ name: "", type: "uint64", internalType: "uint64" }],
        outputs: [
            { name: "supplyRate", type: "uint256", internalType: "uint256" },
            { name: "timestamp", type: "uint256", internalType: "uint256" },
            { name: "active", type: "bool", internalType: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "monitoredChains",
        inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint64", internalType: "uint64" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "paused",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "lastRebalanceTimestamp",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "cooldownRemaining",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "deposit",
        inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "withdraw",
        inputs: [{ name: "shares", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "Deposited",
        inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "sharesIssued", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RebalanceTriggered",
        inputs: [
            { name: "targetChain", type: "uint64", indexed: true, internalType: "uint64" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "messageId", type: "bytes32", indexed: false, internalType: "bytes32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "YieldDataUpdated",
        inputs: [
            { name: "chainSelector", type: "uint64", indexed: true, internalType: "uint64" },
            { name: "supplyRate", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "function",
        name: "getUserBalance",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getAllYieldData",
        inputs: [],
        outputs: [
            { name: "chains", type: "uint64[]", internalType: "uint64[]" },
            { name: "rates", type: "uint256[]", internalType: "uint256[]" },
            { name: "timestamps", type: "uint256[]", internalType: "uint256[]" },
        ],
        stateMutability: "view",
    },
] as const;

export const yieldOracleAbi = [
    {
        type: "function",
        name: "getPrice",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
] as const;

export const erc20Abi = [
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "approve",
        inputs: [
            { name: "spender", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "allowance",
        inputs: [
            { name: "owner", type: "address", internalType: "address" },
            { name: "spender", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
] as const;

export const mockUsdcAbi = [
    ...erc20Abi,
    {
        type: "function",
        name: "mint",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "drip",
        inputs: [{ name: "to", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
] as const;

export const chains = {
    arbitrumSepolia: {
        id: 421614,
        name: "Arbitrum Sepolia",
        selector: "3478487238524512106", // Verified CCIP selector
        vaultManager: "0xa1de025b706687b9a4ec40a3958aa5dc60bf1b66",
        yieldOracle: "0xAF1330E0AC47D86DAe4c512FE7D744762eac448c",
        usdc: "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D", // CCIP-BnM
        forwarder: "0x53b86167c4658b77132c6481b91faB09C3af72C9",
        consumer: "0xccedf582bd0c94c68761a4ab1ee5445aa7e29642",
    },
    baseSepolia: {
        id: 84532,
        name: "Base Sepolia",
        selector: "10344971235874465080", // Verified CCIP selector
        vaultManager: "0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4",
        yieldOracle: "0x81E6d6CE1a3840d7F98f23aACC30ad9Fc5D5f607",
        usdc: "0x7f8033ff9992730f133b75a571E6025ed34a639A",
        forwarder: "0x82300bd7c3958625581cc2F77bC6464dcEcDF3e5",
        consumer: "0x822443a5e4fd0b467d13a64f8856f0dd42b190f7",
    },
} as const;
