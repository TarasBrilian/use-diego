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

export const chains = {
    arbitrumSepolia: {
        id: 421614,
        name: "Arbitrum Sepolia",
        selector: "3478487238524512106", // Verified CCIP selector
        vaultManager: "0xe195954e128D7c65ba0632128B4F2d84EfE6A8D7",
        yieldOracle: "0xAF1330E0AC47D86DAe4c512FE7D744762eac448c",
        usdc: "0x6BA1b0802D4f483c9a884c5DaA48c35e1Da8737B",
        forwarder: "0xcc61F37f20395755A01F37CE6320523a99746834",
        consumer: "0x789b93c08FadB2a1648d56209e94066A180072aA",
    },
    baseSepolia: {
        id: 84532,
        name: "Base Sepolia",
        selector: "10344971235874465080", // Verified CCIP selector
        vaultManager: "0x37c78AfB59a2D66811565Ca2431BFa395eD7666b",
        yieldOracle: "0x81E6d6CE1a3840d7F98f23aACC30ad9Fc5D5f607",
        usdc: "0x7f8033ff9992730f133b75a571E6025ed34a639A",
        forwarder: "0x712e14843DD031cB47B203470E0942E5dcaAA05b",
        consumer: "0xB746E9106C3EE3195edBedDB132be756124d63BF",
    },
} as const;
