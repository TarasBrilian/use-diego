"use client";

import { useReadContract } from 'wagmi';
import { CONTRACTS, MOCK_AAVE_ABI, VAULT_MANAGER_ABI } from '@/lib/contracts';
import { useEffect, useState } from 'react';
import { ponderClient } from '@/lib/ponder';
import { GET_YIELD_HISTORY } from '@/lib/graphql/queries';

export interface YieldHistoryItem {
    apy: number;
    timestamp: number;
}

export const useYieldData = () => {
    const [history, setHistory] = useState<{ arbitrum: YieldHistoryItem[], base: YieldHistoryItem[] }>({
        arbitrum: [],
        base: [],
    });

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

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [arbRes, baseRes]: any[] = await Promise.all([
                    ponderClient.request(GET_YIELD_HISTORY, { chain: 'ARB', limit: 20 }),
                    ponderClient.request(GET_YIELD_HISTORY, { chain: 'BASE', limit: 20 }),
                ]);

                setHistory({
                    arbitrum: arbRes.yieldSnapshots.items.map((item: any) => ({
                        apy: Number(item.supplyRate) / 1e16,
                        timestamp: Number(item.timestamp),
                    })),
                    base: baseRes.yieldSnapshots.items.map((item: any) => ({
                        apy: Number(item.supplyRate) / 1e16,
                        timestamp: Number(item.timestamp),
                    })),
                });
            } catch (error) {
                console.error("Error fetching yield history:", error);
            }
        };

        fetchHistory();
    }, []);

    return {
        arbitrum: {
            apy: arbYield.data as bigint | undefined,
            isLoading: arbYield.isLoading,
            history: history.arbitrum,
        },
        base: {
            apy: baseYield.data as bigint | undefined,
            isLoading: baseYield.isLoading,
            history: history.base,
        },
        vaultData: vaultYieldData.data as [bigint[], bigint[], bigint[]] | undefined,
        isLoading: arbYield.isLoading || baseYield.isLoading || vaultYieldData.isLoading,
        error: arbYield.error || baseYield.error || vaultYieldData.error,
    };
};
