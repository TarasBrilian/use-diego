"use client";

import { useCheckUpkeep } from '@/hooks/useCheckUpkeep';
import { useVaultManager } from '@/hooks/useVaultManager';
import { formatCooldown } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { DataRow } from '@/components/ui/DataRow';
import { Cpu, Zap, Timer } from 'lucide-react';
import { decodeAbiParameters } from 'viem';

export const AutomationStatus = () => {
    const { needsUpkeep, performData, isLoading } = useCheckUpkeep();
    const { cooldown } = useVaultManager('arbitrum');

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

            <div className="p-4 bg-bg-elevated rounded-md border border-border">
                <div className="text-[10px] text-text-muted uppercase font-mono mb-2">Internal Logs</div>
                <div className="font-mono text-[10px] space-y-1 text-text-secondary select-none">
                    <div className="flex gap-2">
                        <span className="text-accent-teal">[OK]</span>
                        <span>Upkeep conditions verified.</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-text-muted">[..]</span>
                        <span>Scanning for yield differentials &gt; 2.0%</span>
                    </div>
                    {needsUpkeep && (
                        <div className="flex gap-2">
                            <span className="text-accent-orange">[!!]</span>
                            <span className="text-primary italic">Rebalance signal detected. PerformData generated.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
