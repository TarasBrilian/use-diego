"use client";

import { useAccount, useReadContract, useChainId } from "wagmi";
import { vaultManagerAbi, chains } from "@/config/contracts";
import { formatUnits } from "viem";
import { BarChart3, TrendingUp, Clock, ShieldCheck } from "lucide-react";

export function VaultOverview() {
    const chainId = useChainId();
    const { isConnected } = useAccount();
    // Get active chain config
    const activeChain = Object.values(chains).find(c => c.id === chainId);
    const vaultAddress = activeChain?.vaultManager as `0x${string}`;

    const { data: totalAssets } = useReadContract({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "totalAssets",
    });

    const { data: lastRebalance } = useReadContract({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "lastRebalanceTimestamp",
    });

    const { data: isPaused } = useReadContract({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "paused",
    });

    const { data: yields } = useReadContract({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "getAllYieldData",
    });

    const tvl = Number(formatUnits(totalAssets as bigint || BigInt(0), 6));

    // Calculate average APY from all monitored chains
    let apy = 0;
    if (yields && Array.isArray(yields) && yields[1] && yields[1].length > 0) {
        const rates = yields[1] as bigint[];
        const sum = rates.reduce((acc, curr) => acc + Number(formatUnits(curr, 16)), 0);
        apy = sum / rates.length;
    } else {
        apy = 0; // Fallback or loading state
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Global Metrics</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-blue-500/30 transition-all">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3" /> Total TVL
                    </p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight">
                        ${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono">Aggregated across CCIP</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-emerald-500/30 transition-all">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" /> Vault APY
                    </p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight text-emerald-400 italic">
                        {apy.toFixed(2)}%
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono">Net of protocol fees</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-slate-700 transition-all">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Last Activity
                    </p>
                    <h3 className="text-xl font-bold mt-2 tracking-tight text-slate-200 uppercase">
                        {lastRebalance ? new Date(Number(lastRebalance) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono">Chainlink Automation</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> System Health
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'}`} />
                        <h3 className="text-xl font-bold tracking-tight text-slate-200 uppercase">{isPaused ? "Paused" : "Normal"}</h3>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono italic">Verified via CRE</p>
                </div>
            </div>
        </div>
    );
}
