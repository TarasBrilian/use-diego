"use client";

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI } from '@/lib/contracts';

export const useVaultManager = (chainKey: 'arbitrum' | 'base') => {
    const { address } = useAccount();
    const contract = CONTRACTS[chainKey];

    const totalAssets = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'totalAssets',
        chainId: contract.chainId,
        query: {
            refetchInterval: 15_000,
        }
    });

    const userBalance = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getUserSupplyBalance',
        args: address ? [address] : undefined,
        chainId: contract.chainId,
        query: {
            enabled: !!address,
            refetchInterval: 15_000,
        }
    });

    const linkBalance = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getLinkBalance',
        chainId: contract.chainId,
        query: {
            refetchInterval: 30_000,
        }
    });

    const cooldown = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'cooldownRemaining',
        chainId: contract.chainId,
        query: {
            refetchInterval: 10_000,
        }
    });

    return {
        totalAssets: totalAssets.data as bigint | undefined,
        userBalance: userBalance.data as bigint | undefined,
        linkBalance: linkBalance.data as bigint | undefined,
        cooldown: cooldown.data as bigint | undefined,
        isLoading: totalAssets.isLoading || userBalance.isLoading,
        error: totalAssets.error || userBalance.error,
    };
};
