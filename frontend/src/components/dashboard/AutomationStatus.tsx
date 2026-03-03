"use client";

import { useCheckUpkeep } from '@/hooks/useCheckUpkeep';
import { useVaultManager } from '@/hooks/useVaultManager';
import { useCCIPLogs, type CCIPLogEntry } from '@/hooks/useCCIPLogs';
import { formatCooldown } from '@/lib/format';
import { DataRow } from '@/components/ui/DataRow';
import { Zap, Timer } from 'lucide-react';
import { decodeAbiParameters } from 'viem';

export const AutomationStatus = () => {
    const { needsUpkeep, performData } = useCheckUpkeep();
    const { cooldown } = useVaultManager('arbitrum');
    const {
        logs,
        isLoading: logsLoading,
        page,
        setPage,
        hasNextPage,
        hasPrevPage
    } = useCCIPLogs(4);

    const decodePerformData = () => {
        if (!performData || performData === '0x') return null;
        try {
            const decoded = decodeAbiParameters(
                [{ type: 'uint64' }, { type: 'uint256' }, { type: 'uint256' }],
                performData as `0x${string}`
            );
            return {
                targetChain: decoded[0].toString(),
                amount: decoded[1],
                expectedDelta: decoded[2],
            };
        } catch (e) {
            return null;
        }
    };

    const decoded = decodePerformData();

    return (
        <div className="bg-bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <Zap className="w-4 h-4 text-accent-teal" />
                <h3 className="text-sm font-bold uppercase tracking-tight">Chainlink Automation</h3>
            </div>

            <div className="space-y-1 mb-6">
                <DataRow
                    label="Upkeep Status"
                    value={
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${needsUpkeep ? 'bg-accent-teal animate-pulse' : 'bg-slate-500'}`} />
                            <span>{needsUpkeep ? 'REBALANCE_READY' : 'MONITOR_ACTIVE'}</span>
                        </div>
                    }
                />
                <DataRow
                    label="Cooldown"
                    value={
                        <div className="flex items-center gap-1.5">
                            <Timer className="w-3 h-3 text-text-muted" />
                            <span>{cooldown ? formatCooldown(Number(cooldown)) : '0s'}</span>
                        </div>
                    }
                />
                {decoded && (
                    <>
                        <DataRow label="Target Bridge" value={decoded.targetChain === '10344971235874465080' ? 'Base Sepolia' : 'Arbitrum Sepolia'} />
                        <DataRow label="Action" value="Cross-Chain Rebalance" />
                    </>
                )}
            </div>

            <div className="p-4 bg-bg-elevated rounded-md border border-border relative">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] text-text-muted uppercase font-mono">CCIP REBALANCE LOGS</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={!hasPrevPage}
                            className="text-[10px] text-text-muted disabled:opacity-30 hover:text-primary transition-colors font-mono"
                        >
                            [PREV]
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!hasNextPage}
                            className="text-[10px] text-text-muted disabled:opacity-30 hover:text-primary transition-colors font-mono"
                        >
                            [NEXT]
                        </button>
                    </div>
                </div>

                <div className="font-mono text-[10px] space-y-1.5 text-text-secondary">
                    {logsLoading && page === 0 ? (
                        <div className="animate-pulse">Fetching logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-text-muted italic">No rebalance events detected.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex flex-col gap-0.5 border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-accent-teal">[{new Date(log.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                                    <span className="text-text-muted">{new Date(log.timestamp * 1000).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-1 items-center">
                                    <span className="text-primary">{log.originChain} → {log.targetChain}</span>
                                    <span className="text-text-muted">|</span>
                                    <a
                                        href={`https://ccip.chain.link/msg/${log.messageId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent-blue hover:underline decoration-accent-blue/30"
                                    >
                                        {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
