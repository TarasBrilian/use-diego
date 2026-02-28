"use client";

import { Terminal, CheckCircle2, ArrowRightLeft, Zap, Loader2 } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";

export function ActivityLog() {
    const { logs, isLoading } = useActivityLogs();

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold italic tracking-tight uppercase">CRE Activity Log</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                    ) : (
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    )}
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">
                        {isLoading ? "Fetching data..." : "Live monitoring"}
                    </span>
                </div>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isLoading && logs.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500/50" />
                        <p className="text-sm font-medium italic">Synchronizing on-chain events...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Terminal className="w-8 h-8 text-slate-700" />
                        <p className="text-sm font-medium italic">No activity detected yet.</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={log.id} className={`p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors ${i !== logs.length - 1 ? 'border-b border-slate-800' : ''}`}>
                            <div className={`mt-1 p-2 rounded-lg ${log.type === 'rebalance' ? 'bg-blue-500/10 text-blue-400' :
                                log.type === 'oracle' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {log.type === 'rebalance' ? <ArrowRightLeft className="w-4 h-4" /> :
                                    log.type === 'oracle' ? <Zap className="w-4 h-4" /> :
                                        <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{log.type}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-bold uppercase tracking-tighter">{log.chain}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-200">{log.message}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <code className="text-[10px] px-2 py-0.5 bg-slate-950 rounded text-slate-500 border border-slate-800">{log.tx}</code>
                                    <a
                                        href={log.chain === 'Arbitrum'
                                            ? `https://sepolia.arbiscan.io/tx/${log.id.split('-')[0]}`
                                            : `https://sepolia.basescan.org/tx/${log.id.split('-')[0]}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-400 hover:underline font-bold uppercase"
                                    >
                                        View on Explorer
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

