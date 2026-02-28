"use client";

import { useYieldData } from '@/hooks/useYieldData';
import { useCheckUpkeep } from '@/hooks/useCheckUpkeep';
import { formatAPY, formatDelta } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const YieldSpread = () => {
    const { arbitrum, base, isLoading } = useYieldData();
    const { needsUpkeep } = useCheckUpkeep();

    const arbAPY = arbitrum.apy || 0n;
    const baseAPY = base.apy || 0n;

    const deltaValue = Number(baseAPY - arbAPY) / 1e16;
    const isHighDelta = Math.abs(deltaValue) > 2;

    // Arc path constants
    const width = 600;
    const height = 200;
    const padding = 40;
    const arcPath = `M ${padding} ${height - padding} Q ${width / 2} ${padding} ${width - padding} ${height - padding}`;

    // We don't return early for loading anymore to keep the layout stable
    const isFetching = isLoading; // In a production app, we'd distinguish between first load and refetch

    return (
        <div className="w-full bg-bg-surface border border-border rounded-lg p-8 relative overflow-hidden group">
            {/* Background Grid Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className={`relative flex flex-col items-center transition-all duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
                <div className="w-full flex justify-between items-end mb-4">
                    <div className={`text-left transition-all ${isLoading ? 'blur-[4px]' : ''}`}>
                        <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Arbitrum</div>
                        <div className="text-3xl font-mono font-bold text-primary">{formatAPY(arbAPY)}</div>
                    </div>

                    <div className="text-center absolute left-1/2 -translate-x-1/2 top-0">
                        <Badge variant={(needsUpkeep && !isLoading) ? 'rebalancing' : 'active'}>
                            {isLoading ? 'SYNCING_TELEMETRY...' : (needsUpkeep ? 'REBALANCE_TRIGGERED' : 'OPTIMAL_FLIGHT')}
                        </Badge>
                    </div>

                    <div className={`text-right transition-all ${isLoading ? 'blur-[4px]' : ''}`}>
                        <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Base</div>
                        <div className="text-3xl font-mono font-bold text-primary">{formatAPY(baseAPY)}</div>
                    </div>
                </div>

                {/* The Arc Visualization */}
                <div className="relative w-full max-w-[600px] h-[200px]">
                    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-full overflow-visible transition-all duration-700 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                        {/* Background Path */}
                        <path
                            d={arcPath}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="2"
                        />

                        {/* Animated Active Path */}
                        <motion.path
                            d={arcPath}
                            fill="none"
                            stroke={(isHighDelta && !isLoading) ? '#00E5C3' : '#8B8FA8'}
                            strokeWidth={(isHighDelta && !isLoading) ? "4" : "2"}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className={(isHighDelta && !isLoading) ? 'drop-shadow-[0_0_8px_rgba(0,229,195,0.5)]' : ''}
                        />

                        {/* Pulsing indicator if high delta */}
                        {isHighDelta && !isLoading && (
                            <motion.path
                                d={arcPath}
                                fill="none"
                                stroke="#00E5C3"
                                strokeWidth="8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.4, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="blur-sm"
                            />
                        )}
                    </svg>

                    {/* Delta value overlay */}
                    <div className={`absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 text-center transition-all ${isLoading ? 'blur-md' : ''}`}>
                        <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Yield Delta</div>
                        <div className={`text-4xl font-mono font-bold transition-all duration-500 ${(isHighDelta && !isLoading) ? 'text-accent-teal scale-110 drop-shadow-[0_0_10px_rgba(0,229,195,0.3)]' : 'text-text-secondary'}`}>
                            {isLoading ? '??.??%' : formatDelta(arbAPY, baseAPY)}
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-text-muted font-mono mt-4 flex gap-4 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 flex items-center justify-center transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                            <Image src="/assets/arbitrum-arb-logo.svg" alt="Arb" width={12} height={12} />
                        </div>
                        ARB_LP_STABLE
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 flex items-center justify-center transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                            <Image src="/assets/Base_square_blue.svg" alt="Base" width={12} height={12} />
                        </div>
                        BASE_LP_STABLE
                    </div>
                </div>
            </div>
        </div>
    );
};
