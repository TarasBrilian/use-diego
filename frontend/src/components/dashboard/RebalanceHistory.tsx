"use client";

import { usePublicClient } from 'wagmi';
import { chains } from '@/config/contracts';
import { formatUnits } from 'viem';
import { parseAbiItem } from 'viem';
import { ExternalLink, Hash, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';

const REBALANCE_TRIGGERED_EVENT = parseAbiItem(
    'event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)'
);

// CCIP selector → human-readable chain name
const CHAIN_SELECTOR_TO_NAME: Record<string, string> = {
    [chains.arbitrumSepolia.selector]: 'Arbitrum Sepolia',
    [chains.baseSepolia.selector]: 'Base Sepolia',
};

const EXPLORER_TX_URL: Record<string, string> = {
    'Arbitrum Sepolia': 'https://sepolia.arbiscan.io/tx',
    'Base Sepolia': 'https://sepolia.basescan.org/tx',
};

interface RebalanceEvent {
    timestamp: number;
    amount: bigint;
    originChain: string;
    destinationChain: string;
    txHash: string;
    key: string;
}

function formatAmount(raw: bigint): string {
    // USDC BnM is 18 decimals
    const val = parseFloat(formatUnits(raw, 18));
    return `${val.toFixed(4)} USDC BnM`;
}

function formatAge(timestamp: number): string {
    const diff = Date.now() / 1000 - timestamp;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export const RebalanceHistory = () => {
    const [events, setEvents] = useState<RebalanceEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const arbClient = usePublicClient({ chainId: arbitrumSepolia.id });
    const baseClient = usePublicClient({ chainId: baseSepolia.id });

    useEffect(() => {
        const fetchEvents = async () => {
            if (!arbClient || !baseClient) return;

            try {
                // Fetch current block per chain to stay within public RPC 10k-block range limit
                const [arbBlock, baseBlock] = await Promise.all([
                    arbClient.getBlockNumber(),
                    baseClient.getBlockNumber(),
                ]);

                const LOOKBACK = BigInt(50_000);
                const arbFrom = arbBlock > LOOKBACK ? arbBlock - LOOKBACK : BigInt(0);
                const baseFrom = baseBlock > LOOKBACK ? baseBlock - LOOKBACK : BigInt(0);

                const [arbLogs, baseLogs] = await Promise.all([
                    arbClient.getLogs({
                        address: chains.arbitrumSepolia.vaultManager as `0x${string}`,
                        event: REBALANCE_TRIGGERED_EVENT,
                        fromBlock: arbFrom,
                    }).catch((e) => { console.error('Arb getLogs error:', e); return []; }),
                    baseClient.getLogs({
                        address: chains.baseSepolia.vaultManager as `0x${string}`,
                        event: REBALANCE_TRIGGERED_EVENT,
                        fromBlock: baseFrom,
                    }).catch((e) => { console.error('Base getLogs error:', e); return []; }),
                ]);

                const tagged = [
                    ...arbLogs.map(log => ({ log, originChain: 'Arbitrum Sepolia', client: arbClient })),
                    ...baseLogs.map(log => ({ log, originChain: 'Base Sepolia', client: baseClient })),
                ];

                const formatted = await Promise.all(
                    tagged.map(async ({ log, originChain, client }) => {
                        const block = await client.getBlock({ blockNumber: log.blockNumber });
                        const targetSelector = (log.args.targetChain as bigint).toString();
                        const destinationChain = CHAIN_SELECTOR_TO_NAME[targetSelector] ?? `Chain ${targetSelector}`;

                        return {
                            timestamp: Number(block.timestamp),
                            amount: log.args.amount as bigint,
                            originChain,
                            destinationChain,
                            txHash: log.transactionHash as string,
                            key: `${log.transactionHash}-${log.logIndex}`,
                        } satisfies RebalanceEvent;
                    })
                );

                setEvents(formatted.sort((a, b) => b.timestamp - a.timestamp));
            } catch (e) {
                console.error('Error fetching rebalance events:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [arbClient, baseClient]);

    return (
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary">
                    <HistoryIcon className="w-4 h-4 text-accent-teal" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Rebalance History</h3>
                </div>
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest italic">
                    Last sync: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-bg-base/50 text-text-muted uppercase border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-medium">Timestamp</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Origin</th>
                            <th className="px-6 py-3 font-medium">Destination</th>
                            <th className="px-6 py-3 font-medium">Tx Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    Loading rebalance events...
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    No rebalance events detected on-chain.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-text-secondary">
                                        {formatAge(event.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 text-primary font-semibold">
                                        {formatAmount(event.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {event.originChain}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <ArrowRight className="w-3 h-3 text-text-muted" />
                                            <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                {event.destinationChain}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`${EXPLORER_TX_URL[event.originChain]}/${event.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-accent-teal hover:underline"
                                        >
                                            <Hash className="w-3 h-3" />
                                            {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                                            <ExternalLink className="w-2 h-2" />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
