"use client";

import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI } from '@/lib/contracts';
import { formatAssets, formatAge } from '@/lib/format';
import { ExternalLink, Hash, ArrowRightLeft, Clock, History as HistoryIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { parseAbiItem } from 'viem';

interface RebalanceEvent {
    timestamp: number;
    amount: bigint;
    targetChain: string;
    messageId: string;
    txHash: string;
}

export const RebalanceHistory = () => {
    const [events, setEvents] = useState<RebalanceEvent[]>([]);
    const publicClient = usePublicClient();

    useEffect(() => {
        const fetchEvents = async () => {
            if (!publicClient) return;

            try {
                const logs = await publicClient.getLogs({
                    address: CONTRACTS.arbitrum.vaultManager as `0x${string}`,
                    event: parseAbiItem('event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)'),
                    fromBlock: 'earliest',
                });

                const formattedEvents = await Promise.all(logs.map(async (log) => {
                    const block = await publicClient.getBlock({ blockHash: log.blockHash });
                    return {
                        timestamp: Number(block.timestamp),
                        amount: log.args.amount as bigint,
                        targetChain: log.args.targetChain?.toString() || '',
                        messageId: log.args.messageId as string,
                        txHash: log.transactionHash,
                    };
                }));

                setEvents(formattedEvents.sort((a, b) => b.timestamp - a.timestamp));
            } catch (e) {
                console.error('Error fetching rebalance events:', e);
            }
        };

        fetchEvents();
    }, [publicClient]);

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
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Target Chain</th>
                            <th className="px-6 py-3 font-medium">CCIP Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    No rebalance events detected on-chain.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.messageId} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-text-secondary">
                                        {formatAge(event.timestamp)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            CCIP_REBALANCE
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-primary">
                                        {formatAssets(event.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {event.targetChain === '10344971235874465080' ? 'Base Sepolia' : 'Arbitrum Sepolia'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`https://ccip.chain.link/msg/${event.messageId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-accent-teal hover:underline"
                                        >
                                            <Hash className="w-3 h-3" />
                                            {event.messageId.slice(0, 10)}...
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
