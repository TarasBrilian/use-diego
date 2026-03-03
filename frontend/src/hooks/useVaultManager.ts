"use client";

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI } from '@/lib/contracts';
import { useEffect, useState } from 'react';
import { ponderClient } from '@/lib/ponder';
import { GET_VAULT_STATE } from '@/lib/graphql/queries';

export const useVaultManager = (chainKey: 'arbitrum' | 'base') => {
    const { address } = useAccount();
    const contract = CONTRACTS[chainKey];

    const [indexedAssets, setIndexedAssets] = useState<bigint | undefined>(undefined);
    const [isIndexerLoading, setIsIndexerLoading] = useState(true);

    // Keep live totalAssets read as fallback/periodic update if needed, 
    // but we can prioritize indexed data for instant display across chains
    const totalAssets = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'totalAssets',
        chainId: contract.chainId,
        query: {
            refetchInterval: 30_000, // Reduced frequency since we have indexer
        }
    });

    useEffect(() => {
        const fetchVaultState = async () => {
            try {
                const data: any = await ponderClient.request(GET_VAULT_STATE);
                const targetLabel = chainKey === 'arbitrum' ? 'ARB' : 'BASE';
                const state = data.vaultStates.items.find((s: any) => s.chain === targetLabel);
                if (state) {
                    setIndexedAssets(BigInt(state.totalAssets));
                }
            } catch (error) {
                console.error("Error fetching vault state from indexer:", error);
            } finally {
                setIsIndexerLoading(false);
            }
        };

        fetchVaultState();
    }, [chainKey]);

    const userBalance = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getUserBalance',
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
            refetchInterval: 60_000,
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

    const userShares = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'userShares',
        args: address ? [address] : undefined,
        chainId: contract.chainId,
        query: {
            enabled: !!address,
            refetchInterval: 15_000,
        }
    });

    const paused = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'paused',
        chainId: contract.chainId,
        query: {
            refetchInterval: 30_000,
        }
    });

    return {
        totalAssets: (indexedAssets && indexedAssets > 0n) ? indexedAssets : (totalAssets.data as bigint | undefined),
        userBalance: userBalance.data as bigint | undefined,
        userShares: userShares.data as bigint | undefined,
        linkBalance: linkBalance.data as bigint | undefined,
        cooldown: cooldown.data as bigint | undefined,
        paused: paused.data as boolean | undefined,
        isLoading: (isIndexerLoading && !totalAssets.data) || userBalance.isLoading || userShares.isLoading,
        error: totalAssets.error || userBalance.error || userShares.error,
    };
};
