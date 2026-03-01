import { parseAbi } from 'viem'

export const CONTRACTS = {
    arbitrum: {
        chainId: 421614,
        vaultManager: '0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66',
        consumer: '0xCCedf582BD0c94c68761A4Ab1Ee5445aA7E29642',
        mockAave: '0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7',
        ccipBnM: '0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D',
        link: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
        automationForwarder: '0x53b86167c4658b77132c6481b91faB09C3af72C9',
        forwarder: '0xcc61F37f20395755A01F37CE6320523a99746834',
    },
    base: {
        chainId: 84532,
        vaultManager: '0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4',
        consumer: '0xe3521D9d8b0CF6de832bc23e3ED41b919Ec31647',
        mockAave: '0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA',
        ccipBnM: '0x88A2d74F47a237a62e7A51cdDa67270CE381555e',
        link: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
        automationForwarder: '0xdCD67F7b6b96f115fe1515bEd953d4031692685E',
        forwarder: '0x712e14843DD031cB47B203470E0942E5dcaAA05b',
    },
} as const

export const CHAIN_SELECTORS = {
    arbitrum: '3478487238524512106',
    base: '10344971235874465080',
} as const

export const VAULT_MANAGER_ABI = parseAbi([
    'function totalAssets() view returns (uint256)',
    'function getAllYieldData() view returns (uint64[], uint256[], uint256[])',
    'function checkUpkeep(bytes) view returns (bool, bytes)',
    'function cooldownRemaining() view returns (uint256)',
    'function getLinkBalance() view returns (uint256)',
    'function getUserBalance(address) view returns (uint256)',
    'function userShares(address) view returns (uint256)',
    'function paused() view returns (bool)',
    'function deposit(uint256 amount)',
    'function withdraw(uint256 shares) returns (uint256)',
    'function resetCooldown()',
    'event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)',
    'event YieldDataUpdated(uint64 indexed chainSelector, uint256 supplyRate, uint256 timestamp)',
    'event Deposit(address indexed user, uint256 assets, uint256 shares)',
])

export const MOCK_AAVE_ABI = parseAbi([
    'function getSupplyAPY() view returns (uint256)',
    'function getUserSupplyBalance(address) view returns (uint256)',
])

export const ERC20_ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function drip(address to)',
])

