"use client";

import { Badge } from '@/components/ui/Badge';
import { DataRow } from '@/components/ui/DataRow';
import { Cpu, Terminal, ShieldCheck, History } from 'lucide-react';
import { useEffect, useState } from 'react';

export const CREStatus = () => {
    const [lastRun, setLastRun] = useState<{ timestamp: number, status: string } | null>(null);

    useEffect(() => {
        // Mocking last run data from localStorage
        const stored = localStorage.getItem('cre_last_run');
        if (stored) {
            setLastRun(JSON.parse(stored));
        } else {
            setLastRun({ timestamp: Date.now() / 1000 - 450, status: 'success' });
        }
    }, []);

    return (
        <div className="bg-bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <Cpu className="w-4 h-4 text-accent-teal" />
                <h3 className="text-sm font-bold uppercase tracking-tight">Chainlink CRE Node</h3>
            </div>

            <div className="space-y-1 mb-6">
                <DataRow
                    label="Last Execution"
                    value={lastRun ? new Date(lastRun.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                />
                <DataRow
                    label="Workflow Status"
                    value={
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-accent-teal" />
                            <span className="text-accent-teal">VERIFIED</span>
                        </div>
                    }
                />
                <DataRow label="Fetchers Active" value="AAVE_V3_SUBGRAPH" />
            </div>

            <div className="p-4 bg-bg-elevated rounded-md border border-border">
                <div className="text-[10px] text-text-muted uppercase font-mono mb-2">Runtime Environment</div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-text-muted" />
                            <span className="text-[10px] text-text-secondary font-mono">Workflow CID: </span>
                        </div>
                        <span className="text-[10px] text-primary font-mono truncate max-w-[120px]">ba...q3z</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-3 h-3 text-text-muted" />
                            <span className="text-[10px] text-text-secondary font-mono">Consensus: </span>
                        </div>
                        <span className="text-[10px] text-primary font-mono lowercase">off-chain_report_v2</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
