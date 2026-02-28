"use client";

import { useReadContract } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI } from '@/lib/contracts';

export const useCheckUpkeep = () => {
    const upkeep = useReadContract({
        address: CONTRACTS.arbitrum.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'checkUpkeep',
        args: ['0x'],
        chainId: CONTRACTS.arbitrum.chainId,
        query: {
            refetchInterval: 20_000,
        }
    });

    return {
        needsUpkeep: upkeep.data ? (upkeep.data as [boolean, string])[0] : false,
        performData: upkeep.data ? (upkeep.data as [boolean, string])[1] : '0x',
        isLoading: upkeep.isLoading,
        error: upkeep.error,
    };
};
