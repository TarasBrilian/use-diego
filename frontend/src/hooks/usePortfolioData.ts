"use client";

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { ponderClient } from '@/lib/ponder';
import { GET_USER_PORTFOLIO } from '@/lib/graphql/queries';

export function usePortfolioData() {
    const { address } = useAccount();

    const [netDeposits, setNetDeposits] = useState({
        arbitrum: 0n,
        base: 0n,
        total: 0n,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data: any = await ponderClient.request(GET_USER_PORTFOLIO, {
                    user: address.toLowerCase(),
                });

                let arbNet = 0n;
                let baseNet = 0n;

                data.depositEvents.items.forEach((item: any) => {
                    if (item.chain === 'ARB') arbNet += BigInt(item.amount);
                    if (item.chain === 'BASE') baseNet += BigInt(item.amount);
                });

                data.withdrawEvents.items.forEach((item: any) => {
                    if (item.chain === 'ARB') arbNet -= BigInt(item.amount);
                    if (item.chain === 'BASE') baseNet -= BigInt(item.amount);
                });

                // Prevent negative due to weird block indexing mismatches
                if (arbNet < 0n) arbNet = 0n;
                if (baseNet < 0n) baseNet = 0n;

                setNetDeposits({
                    arbitrum: arbNet,
                    base: baseNet,
                    total: arbNet + baseNet,
                });
            } catch (e) {
                console.error('Error fetching net deposits from indexer:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [address]);

    return { netDeposits, isLoading };
}
