"use client";

import { usePublicClient, useAccount } from 'wagmi';
import { chains } from '@/config/contracts';
import { formatUnits, parseAbiItem } from 'viem';
import { ExternalLink, Hash, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';

const DEPOSITED_EVENT = parseAbiItem(
    'event Deposited(address indexed user, uint256 amount, uint256 sharesIssued)'
);

const WITHDRAWN_EVENT = parseAbiItem(
    'event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned)'
);

const EXPLORER_TX_URL: Record<string, string> = {
    'Arbitrum Sepolia': 'https://sepolia.arbiscan.io/tx',
    'Base Sepolia': 'https://sepolia.basescan.org/tx',
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
    const val = parseFloat(formatUnits(raw, 18));
    return `${val.toFixed(4)} CCIP-BnM`;
}

function formatAge(timestamp: number): string {
    const diff = Date.now() / 1000 - timestamp;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export const TransactionHistory = () => {
    const { address } = useAccount();
    const [events, setEvents] = useState<TransactionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const arbClient = usePublicClient({ chainId: arbitrumSepolia.id });
    const baseClient = usePublicClient({ chainId: baseSepolia.id });

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

                const taggedEvents = [
                    ...arbDep.map(log => ({ log, type: 'Deposit' as const, chain: 'Arbitrum Sepolia', client: arbClient })),
                    ...arbWith.map(log => ({ log, type: 'Withdraw' as const, chain: 'Arbitrum Sepolia', client: arbClient })),
                    ...baseDep.map(log => ({ log, type: 'Deposit' as const, chain: 'Base Sepolia', client: baseClient })),
                    ...baseWith.map(log => ({ log, type: 'Withdraw' as const, chain: 'Base Sepolia', client: baseClient })),
                ];

                const formatted = await Promise.all(
                    taggedEvents.map(async ({ log, type, chain, client }) => {
                        const block = await client.getBlock({ blockNumber: log.blockNumber });
                        return {
                            timestamp: Number(block.timestamp),
                            amount: log.args.amount as bigint,
                            type,
                            chain,
                            txHash: log.transactionHash as string,
                            key: `${log.transactionHash}-${log.logIndex}`,
                        } satisfies TransactionEvent;
                    })
                );

                setEvents(formatted.sort((a, b) => b.timestamp - a.timestamp));
            } catch (e) {
                console.error('Error fetching transaction events:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [arbClient, baseClient, address]);

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
