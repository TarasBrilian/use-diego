"use client";

import { useReadContract } from 'wagmi';
import { CONTRACTS, MOCK_AAVE_ABI, VAULT_MANAGER_ABI } from '@/lib/contracts';

export const useYieldData = () => {
    const arbYield = useReadContract({
        address: CONTRACTS.arbitrum.mockAave as `0x${string}`,
        abi: MOCK_AAVE_ABI,
        functionName: 'getSupplyAPY',
        chainId: CONTRACTS.arbitrum.chainId,
        query: {
            refetchInterval: 30_000,
        }
    });

    const baseYield = useReadContract({
        address: CONTRACTS.base.mockAave as `0x${string}`,
        abi: MOCK_AAVE_ABI,
        functionName: 'getSupplyAPY',
        chainId: CONTRACTS.base.chainId,
        query: {
            refetchInterval: 30_000,
        }
    });

    const vaultYieldData = useReadContract({
        address: CONTRACTS.arbitrum.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getAllYieldData',
        chainId: CONTRACTS.arbitrum.chainId,
        query: {
            refetchInterval: 30_000,
        }
    });

    return {
        arbitrum: {
            apy: arbYield.data as bigint | undefined,
            isLoading: arbYield.isLoading,
        },
        base: {
            apy: baseYield.data as bigint | undefined,
            isLoading: baseYield.isLoading,
        },
        vaultData: vaultYieldData.data as [bigint[], bigint[], bigint[]] | undefined,
        isLoading: arbYield.isLoading || baseYield.isLoading || vaultYieldData.isLoading,
        error: arbYield.error || baseYield.error || vaultYieldData.error,
    };
};
