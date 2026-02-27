"use client";

import { useChainId, useReadContracts } from "wagmi";
import { vaultManagerAbi, chains } from "@/config/contracts";
import { formatUnits } from "viem";

export function YieldTable() {
    const chainId = useChainId();
    const activeChain = Object.values(chains).find(c => c.id === chainId);
    const vaultAddress = activeChain?.vaultManager as `0x${string}`;

    const chainList = Object.values(chains);

    const contracts = chainList.map(c => ({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "chainYieldData",
        args: [BigInt(c.selector)],
    }));

    const { data: yields } = useReadContracts({
        contracts,
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold italic tracking-tight">Cross-Chain Yield Comparison</h2>
                <p className="text-slate-400 text-sm">Real-time yield data fetched from Diego Oracles</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Chain</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Gross APY</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Net APY</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {chainList.map((c, i) => {
                            const yieldData = yields?.[i]?.result as any;
                            const rate = yieldData ? Number(formatUnits(yieldData[0], 16)) : 0;

                            return (
                                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${c.id === chainId ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
                                            <span className="font-semibold">{c.name}</span>
                                            {c.id === chainId && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-300">
                                        {rate > 0 ? `${rate.toFixed(2)}%` : "0.00%"}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                                        {rate > 0 ? `${(rate * 0.95).toFixed(2)}%` : "0.00%"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                                            Optimal
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
