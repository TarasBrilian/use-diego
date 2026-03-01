"use client";

import { usePublicClient, useAccount } from 'wagmi';
import { chains } from '@/config/contracts';
import { parseAbiItem } from 'viem';
import { useEffect, useState } from 'react';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';

const DEPOSITED_EVENT = parseAbiItem(
    'event Deposited(address indexed user, uint256 amount, uint256 sharesIssued)'
);

const WITHDRAWN_EVENT = parseAbiItem(
    'event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned)'
);

export function usePortfolioData() {
    const { address } = useAccount();
    const arbClient = usePublicClient({ chainId: arbitrumSepolia.id });
    const baseClient = usePublicClient({ chainId: baseSepolia.id });

    const [netDeposits, setNetDeposits] = useState({
        arbitrum: 0n,
        base: 0n,
        total: 0n,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!arbClient || !baseClient || !address) {
                if (!address) setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const [arbBlock, baseBlock] = await Promise.all([
                    arbClient.getBlockNumber(),
                    baseClient.getBlockNumber(),
                ]);

                const LOOKBACK = BigInt(50_000);
                const arbFrom = arbBlock > LOOKBACK ? arbBlock - LOOKBACK : BigInt(0);
                const baseFrom = baseBlock > LOOKBACK ? baseBlock - LOOKBACK : BigInt(0);

                const arbArgs = { user: address };
                const baseArgs = { user: address };

                const [arbDep, arbWith, baseDep, baseWith] = await Promise.all([
                    arbClient.getLogs({
                        address: chains.arbitrumSepolia.vaultManager as `0x${string}`,
                        event: DEPOSITED_EVENT,
                        args: arbArgs,
                        fromBlock: arbFrom,
                    }).catch(() => []),
                    arbClient.getLogs({
                        address: chains.arbitrumSepolia.vaultManager as `0x${string}`,
                        event: WITHDRAWN_EVENT,
                        args: arbArgs,
                        fromBlock: arbFrom,
                    }).catch(() => []),
                    baseClient.getLogs({
                        address: chains.baseSepolia.vaultManager as `0x${string}`,
                        event: DEPOSITED_EVENT,
                        args: baseArgs,
                        fromBlock: baseFrom,
                    }).catch(() => []),
                    baseClient.getLogs({
                        address: chains.baseSepolia.vaultManager as `0x${string}`,
                        event: WITHDRAWN_EVENT,
                        args: baseArgs,
                        fromBlock: baseFrom,
                    }).catch(() => []),
                ]);

                let arbNet = 0n;
                for (const log of arbDep) arbNet += (log.args.amount as bigint);
                for (const log of arbWith) arbNet -= (log.args.amount as bigint);

                let baseNet = 0n;
                for (const log of baseDep) baseNet += (log.args.amount as bigint);
                for (const log of baseWith) baseNet -= (log.args.amount as bigint);

                // Prevent negative due to weird block indexing mismatches
                if (arbNet < 0n) arbNet = 0n;
                if (baseNet < 0n) baseNet = 0n;

                setNetDeposits({
                    arbitrum: arbNet,
                    base: baseNet,
                    total: arbNet + baseNet,
                });
            } catch (e) {
                console.error('Error fetching net deposits:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [arbClient, baseClient, address]);

    return { netDeposits, isLoading };
}
