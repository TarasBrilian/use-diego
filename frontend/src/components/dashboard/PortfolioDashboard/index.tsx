"use client";

import { useVaultManager } from '@/hooks/useVaultManager';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { useYieldData } from '@/hooks/useYieldData';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatAPY } from '@/lib/format';
import { formatUnits } from 'viem';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';

const EXPLORER_TX_URL: Record<string, string> = {
    'Arbitrum': 'https://sepolia.arbiscan.io/tx',
    'Base': 'https://sepolia.basescan.org/tx',
};

function formatCCIPAmount(raw: bigint | number): string {
    const val = typeof raw === 'bigint' ? parseFloat(formatUnits(raw, 18)) : raw;
    return `${val.toFixed(4)}`;
}

export const PortfolioDashboard = () => {
    // 1. Fetch User Data
    const {
        userBalance: arbVal,
        userShares: arbShares,
        totalAssets: arbTvl,
    } = useVaultManager('arbitrum');

    const {
        userBalance: baseVal,
        userShares: baseShares,
        totalAssets: baseTvl,
    } = useVaultManager('base');

    // 2. Fetch Net Deposits
    const { netDeposits, isLoading: netLoading } = usePortfolioData();

    // 3. Fetch APY Data
    const { arbitrum: arbYield, base: baseYield } = useYieldData();

    // 4. Fetch All Activity
    const { logs, isLoading: logsLoading } = useActivityLogs();
    const rebalances = logs.filter(l => l.type === 'rebalance');

    // Aggregate Calculations
    const arbBalance = arbVal || 0n;
    const baseBalance = baseVal || 0n;
    const totalCurrentValue = arbBalance + baseBalance;
    const totalDeposited = netDeposits.total;

    // Yield Earned
    const yieldEarned = totalCurrentValue > totalDeposited
        ? totalCurrentValue - totalDeposited
        : 0n;

    const arbYieldEarned = arbBalance > netDeposits.arbitrum ? arbBalance - netDeposits.arbitrum : 0n;
    const baseYieldEarned = baseBalance > netDeposits.base ? baseBalance - netDeposits.base : 0n;

    // Weighted APY
    const arbApyNum = Number(arbYield.apy || 0n);
    const baseApyNum = Number(baseYield.apy || 0n);

    let weightedApy = 0;
    if (totalCurrentValue > 0n) {
        const arbWeight = Number(arbBalance) / Number(totalCurrentValue);
        const baseWeight = Number(baseBalance) / Number(totalCurrentValue);
        weightedApy = (arbWeight * arbApyNum) + (baseWeight * baseApyNum);
    }

    // Chart Data Generation (Mocked for visual, real data would need historical TVL indexing)
    const generateChartData = () => {
        const data = [];
        let baseValue = 23.0;
        for (let i = 0; i < 7; i++) {
            baseValue += Math.random() * 0.2;
            data.push({
                name: `Day ${i + 1}`,
                value: baseValue,
                isRebalance: i === 2 || i === 5,
            });
        }
        return data;
    };
    const chartData = generateChartData();

    const StatBox = ({ title, value, unit, subtext, highlightColor = 'text-accent-teal' }: any) => (
        <div className="bg-[#12141A] border border-[#1E222B] rounded-lg p-6 flex flex-col justify-between h-[120px]">
            <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest">{title}</div>
            <div>
                <div className={`text-3xl font-mono font-bold ${highlightColor}`}>
                    {value}
                </div>
                <div className="text-[10px] text-text-muted mt-1 font-mono">{unit && `${unit} `}{subtext}</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1 mt-10">Portfolio</h1>
                    <p className="text-text-muted text-sm font-mono">Your positions across all chains</p>
                </div>
                <Badge variant="active" className="px-3 py-1">LIVE</Badge>
            </div>

            {/* Top 4 Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#12141A] border border-accent-teal/30 rounded-lg p-6 flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-accent-teal to-transparent opacity-50"></div>
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Total Value</div>
                    <div>
                        <div className="text-3xl font-mono font-bold text-accent-teal">
                            {formatCCIPAmount(totalCurrentValue)}
                        </div>
                        <div className="text-[10px] text-text-muted mt-1 font-mono">CCIP-BnM across 2 chains</div>
                    </div>
                </div>

                <StatBox
                    title="Yield Earned"
                    value={`+${formatCCIPAmount(yieldEarned)}`}
                    highlightColor="text-emerald-400"
                    subtext="since deposit"
                />

                <StatBox
                    title="Avg APY"
                    value={formatAPY(BigInt(Math.floor(weightedApy)))}
                    highlightColor="text-orange-400"
                    subtext="weighted across positions"
                />

                <StatBox
                    title="Rebalances"
                    value={rebalances.length.toString()}
                    highlightColor="text-white"
                    subtext="total cross-chain moves"
                />
            </div>

            {/* Chart Section */}
            <div className="bg-[#12141A] border border-[#1E222B] rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Yield Over Time</div>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-md border border-white/10">
                        <button className="px-3 py-1 text-[10px] items-center text-text-muted hover:text-white rounded">1D</button>
                        <button className="px-3 py-1 text-[10px] items-center text-accent-teal border border-accent-teal/20 bg-accent-teal/10 rounded">1W</button>
                        <button className="px-3 py-1 text-[10px] items-center text-text-muted hover:text-white rounded">1M</button>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5C3" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00E5C3" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <YAxis
                                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'monospace' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#12141A', borderColor: '#1E222B', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                                itemStyle={{ color: '#00E5C3' }}
                                labelStyle={{ color: '#8B8FA8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#00E5C3"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                activeDot={{ r: 4, fill: "#00E5C3", stroke: "#12141A", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-start gap-6 mt-4 font-mono text-[10px] text-text-muted">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-accent-teal"></div>
                        Portfolio Value
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        Rebalance Event
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-8 mb-4">Positions By Chain</div>

            {/* Positions By Chain - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arbitrum */}
                <div className="bg-[#12141A] border border-[#1E222B] rounded-lg p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-mono">
                                <Image src="/assets/arbitrum-arb-logo.svg" alt="Arbitrum" width={24} height={24} />
                            </div>
                            <div>
                                <div className="text-white font-bold">Arbitrum</div>
                                <div className="text-[10px] text-text-muted font-mono">Sepolia Testnet</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-mono rounded">
                            {formatAPY(arbYield.apy || 0n)} APY
                        </div>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Deposited</span>
                            <span className="text-white">{formatCCIPAmount(netDeposits.arbitrum)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Current Value</span>
                            <span className="text-accent-teal">{formatCCIPAmount(arbBalance)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Yield Earned</span>
                            <span className="text-emerald-400">+{formatCCIPAmount(arbYieldEarned)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Share Balance</span>
                            <span className="text-white">{formatCCIPAmount(arbShares || 0n)} shares</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Vault TVL</span>
                            <span className="text-text-secondary">{formatCCIPAmount(arbTvl || 0n)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Your Share</span>
                            <span className="text-text-secondary">
                                {totalCurrentValue > 0n ? ((Number(arbBalance) / Number(totalCurrentValue)) * 100).toFixed(2) : '0.00'}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Base */}
                <div className="bg-[#12141A] border border-[#1E222B] rounded-lg p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 font-bold font-mono">
                                <Image src="/assets/base_square_blue.svg" alt="Base" width={24} height={24} />
                            </div>
                            <div>
                                <div className="text-white font-bold">Base</div>
                                <div className="text-[10px] text-text-muted font-mono">Sepolia Testnet</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-mono rounded">
                            {formatAPY(baseYield.apy || 0n)} APY
                        </div>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Deposited</span>
                            <span className="text-white">{formatCCIPAmount(netDeposits.base)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Current Value</span>
                            <span className="text-accent-teal">{formatCCIPAmount(baseBalance)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Yield Earned</span>
                            <span className="text-emerald-400">+{formatCCIPAmount(baseYieldEarned)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Share Balance</span>
                            <span className="text-white">{formatCCIPAmount(baseShares || 0n)} shares</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1E222B] pb-3">
                            <span className="text-text-muted">Vault TVL</span>
                            <span className="text-text-secondary">{formatCCIPAmount(baseTvl || 0n)} CCIP-BnM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Your Share</span>
                            <span className="text-text-secondary">
                                {totalCurrentValue > 0n ? ((Number(baseBalance) / Number(totalCurrentValue)) * 100).toFixed(2) : '0.00'}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rebalancing History */}
            <div className="bg-[#12141A] border border-[#1E222B] rounded-lg mt-6 overflow-hidden">
                <div className="p-6 border-b border-[#1E222B] flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Rebalancing History</h3>
                    <div className="text-[10px] font-mono text-text-muted bg-white/5 px-2 py-1 rounded border border-white/10">
                        {rebalances.length} events
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                        <thead className="text-[#8B8FA8] uppercase border-b border-[#1E222B]">
                            <tr>
                                <th className="px-6 py-4 font-normal text-[10px] tracking-widest">Time</th>
                                <th className="px-6 py-4 font-normal text-[10px] tracking-widest">Route</th>
                                <th className="px-6 py-4 font-normal text-[10px] tracking-widest">Amount</th>
                                <th className="px-6 py-4 font-normal text-[10px] tracking-widest">CCIP Message</th>
                                <th className="px-6 py-4 font-normal text-[10px] tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E222B]">
                            {rebalances.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted italic">
                                        No cross-chain rebalances recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                rebalances.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-text-muted">{log.time}</td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded text-[#8B8FA8]">
                                                {log.message.includes('Arbitrum to Base') ? 'ARB → BASE' : 'BASE → ARB'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-accent-teal">
                                            {/* Extract amount from message like "CCIP Rebalance: 10.50 USDC moved..." */}
                                            {log.message.split('Rebalance: ')[1]?.split(' ')[0] || '0.00'} CCIP-BnM
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`${EXPLORER_TX_URL[log.chain] || 'https://ccip.chain.link'}/${log.tx}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent-teal hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                {log.tx} ↗
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                SUCCESS
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
