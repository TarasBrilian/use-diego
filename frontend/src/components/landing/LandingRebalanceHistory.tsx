"use client";

import { formatUnits } from 'viem';
import { ExternalLink, Hash, History as HistoryIcon, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCCIPLogs } from '@/hooks/useCCIPLogs';

const EXPLORER_TX_URL: Record<string, string> = {
    'Arbitrum': 'https://sepolia.arbiscan.io/tx',
    'Base': 'https://sepolia.basescan.org/tx',
};

function formatAmount(raw: bigint): string {
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

export function LandingRebalanceHistory() {
    const { logs, isLoading } = useCCIPLogs(10);

    return (
        <section className="py-24 bg-[#0A0B0E] relative border-t border-white/[0.04] flex justify-center w-full">
            <div className="w-full max-w-[1400px] px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-[#0A0B0E] border border-white/20 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.02)]"
                >
                    <div className="p-5 flex justify-between items-center bg-[#0A0B0E] border-b border-white/20 relative">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="flex items-center gap-3 text-white">
                            <HistoryIcon className="w-4 h-4 text-white opacity-80" />
                            <h3 className="text-sm font-bold tracking-widest uppercase">Rebalance History</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono tracking-widest uppercase italic pr-2">
                            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Last sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-mono text-xs whitespace-nowrap min-w-[900px]">
                            <thead className="bg-[#0A0B0E] text-white/50 uppercase border-b border-white/20">
                                <tr>
                                    <th className="px-6 py-4 font-normal tracking-wider w-[15%]">Timestamp</th>
                                    <th className="px-6 py-4 font-normal tracking-wider w-[20%]">Amount</th>
                                    <th className="px-6 py-4 font-normal tracking-wider w-[20%]">Origin</th>
                                    <th className="px-6 py-4 font-normal tracking-wider w-[20%]">Destination</th>
                                    <th className="px-6 py-4 font-normal tracking-wider w-[25%]">Tx Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 bg-[#0A0B0E]">
                                {isLoading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/30 italic">
                                            Loading rebalance events...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/30 italic">
                                            No rebalance events detected on-chain.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5 text-white/70">
                                                {formatAge(log.timestamp)}
                                            </td>
                                            <td className="px-6 py-5 text-white font-medium">
                                                {formatAmount(log.amount)}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]">
                                                    {log.originChain}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <ArrowRight className="w-3 h-3 text-white/40" />
                                                    <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[11px]">
                                                        {log.targetChain}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <a
                                                    href={`${EXPLORER_TX_URL[log.originChain]}/${log.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                                                >
                                                    <Hash className="w-3 h-3 opacity-60" />
                                                    {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
                                                    <ExternalLink className="w-3 h-3 opacity-60 ml-1" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
