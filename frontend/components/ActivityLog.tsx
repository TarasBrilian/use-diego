"use client";

import { Terminal, CheckCircle2, ArrowRightLeft, Zap } from "lucide-react";

const logs = [
    {
        id: 1,
        time: "2 hours ago",
        type: "rebalance",
        message: "CCIP Rebalance: 50,000 USDC moved from Base to Arbitrum",
        tx: "0x4a2c...b8e1",
        status: "completed"
    },
    {
        id: 2,
        time: "4 hours ago",
        type: "oracle",
        message: "CRE Decision: Arbitrum yield increased to 7.84%. Preparing rebalance.",
        tx: "0x9d1a...c2f4",
        status: "info"
    },
    {
        id: 3,
        time: "12 hours ago",
        type: "deposit",
        message: "New Deposit: 125,000 USDC received on Arbitrum",
        tx: "0x7b3e...f9a2",
        status: "completed"
    }
];

export function ActivityLog() {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold italic tracking-tight uppercase">CRE Activity Log</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                    <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Live monitoring</span>
                </div>
            </div>
            <div className="p-0">
                {logs.map((log, i) => (
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
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{log.type}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-200">{log.message}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <code className="text-[10px] px-2 py-0.5 bg-slate-950 rounded text-slate-500 border border-slate-800">{log.tx}</code>
                                <a href="#" className="text-[10px] text-blue-400 hover:underline font-bold uppercase">View on Explorer</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-slate-950/50 rounded-b-2xl border-t border-slate-800">
                <button className="w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
                    Download full history (CSV)
                </button>
            </div>
        </div>
    );
}
