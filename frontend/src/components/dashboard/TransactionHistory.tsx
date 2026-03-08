"use client";

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { ExternalLink, Hash, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ponderClient } from '@/lib/ponder';
import { GET_ACTIVITY_LOGS } from '@/lib/graphql/queries';

const EXPLORER_TX_URL: Record<string, string> = {
    'ARB': 'https://sepolia.arbiscan.io/tx',
    'BASE': 'https://sepolia.basescan.org/tx',
};

interface TransactionEvent {
    timestamp: number;
    amount: bigint;
    type: 'Deposit' | 'Withdraw';
    chain: string;
    txHash: string;
    key: string;
}

function formatAmount(raw: bigint): string {
    const val = parseFloat(formatUnits(raw, 18)); // USDC BnM is 18 decimals
    return `${val.toFixed(4)} USDC BnM`;
}

function formatAge(timestamp: number): string {
    const diff = Math.floor(Date.now() / 1000 - timestamp);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export const TransactionHistory = () => {
    const { address } = useAccount();
    const [events, setEvents] = useState<TransactionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data: any = await ponderClient.request(GET_ACTIVITY_LOGS, {
                    limit: 20,
                    user: address.toLowerCase(),
                });

                const formatted: TransactionEvent[] = [
                    ...data.depositEvents.items.map((item: any) => ({
                        timestamp: Number(item.timestamp),
                        amount: BigInt(item.amount),
                        type: 'Deposit' as const,
                        chain: item.chain,
                        txHash: item.txHash,
                        key: item.id,
                    })),
                    ...data.withdrawEvents.items.map((item: any) => ({
                        timestamp: Number(item.timestamp),
                        amount: BigInt(item.amount),
                        type: 'Withdraw' as const,
                        chain: item.chain,
                        txHash: item.txHash,
                        key: item.id,
                    })),
                ].sort((a, b) => b.timestamp - a.timestamp);

                setEvents(formatted);
            } catch (e) {
                console.error('Error fetching transaction events from indexer:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [address]);

    return (
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary">
                    <Activity className="w-4 h-4 text-accent-teal" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Transaction History</h3>
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
                            <th className="px-6 py-3 font-medium">Event</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Chain</th>
                            <th className="px-6 py-3 font-medium">Tx Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {!address ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    Connect wallet to view your transaction history.
                                </td>
                            </tr>
                        ) : isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    Loading your transactions...
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    No transactions found for this address.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-text-secondary">
                                        {formatAge(event.timestamp)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {event.type === 'Deposit' ? (
                                                <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <ArrowUpFromLine className="w-4 h-4 text-blue-400" />
                                            )}
                                            <span className={event.type === 'Deposit' ? 'text-emerald-400' : 'text-blue-400'}>
                                                {event.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-primary font-semibold">
                                        {formatAmount(event.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-text-secondary border border-white/10">
                                            {event.chain}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`${EXPLORER_TX_URL[event.chain]}/${event.txHash}`}
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
