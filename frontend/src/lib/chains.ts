import { defineChain } from 'viem'

export const arbitrumSepolia = defineChain({
    id: 421614,
    name: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    },
    blockExplorers: {
        default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
    },
    testnet: true,
})

export const baseSepolia = defineChain({
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://sepolia.base.org'] },
    },
    blockExplorers: {
        default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
    },
    testnet: true,
})
