"use client";

import { formatUnits } from 'viem';
import { ExternalLink, Hash, History as HistoryIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useCCIPLogs } from '@/hooks/useCCIPLogs';
import { useAccount } from 'wagmi';

const EXPLORER_TX_URL: Record<string, string> = {
    'Arbitrum': 'https://sepolia.arbiscan.io/tx',
    'Base': 'https://sepolia.basescan.org/tx',
};

function formatAmount(raw: bigint): string {
    // USDC BnM is 18 decimals for rebalance transfers
    const val = parseFloat(formatUnits(raw, 18));
    return `${val.toFixed(4)} USDC BnM`;
}

function formatAge(timestamp: number): string {
    const diff = Math.floor(Date.now() / 1000 - timestamp);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export const RebalanceHistory = () => {
    const { address } = useAccount();
    const { logs, isLoading } = useCCIPLogs(10, address);

    return (
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary">
                    <HistoryIcon className="w-4 h-4 text-accent-teal" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Rebalance History</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono uppercase tracking-widest italic">
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
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
                        {isLoading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    Loading rebalance events...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">
                                    No rebalance events detected on-chain.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-text-secondary">
                                        {formatAge(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 text-primary font-semibold">
                                        {formatAmount(log.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {log.originChain}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <ArrowRight className="w-3 h-3 text-text-muted" />
                                            <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                {log.targetChain}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={`${EXPLORER_TX_URL[log.originChain]}/${log.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-accent-teal hover:underline"
                                        >
                                            <Hash className="w-3 h-3" />
                                            {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
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
