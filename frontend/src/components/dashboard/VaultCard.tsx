"use client";

import { useVaultManager } from '@/hooks/useVaultManager';
import { useYieldData } from '@/hooks/useYieldData';
import { formatAssets, formatAPY, formatAge } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { DataRow } from '@/components/ui/DataRow';
import { GlowButton } from '@/components/ui/GlowButton';
import { Wallet, Info, Activity, Clock } from 'lucide-react';
import Image from 'next/image';

interface VaultCardProps {
    chain: 'arbitrum' | 'base';
    onDeposit: () => void;
    onWithdraw: () => void;
}

export const VaultCard = ({ chain, onDeposit, onWithdraw }: VaultCardProps) => {
    const { totalAssets, userBalance, linkBalance, isLoading } = useVaultManager(chain);
    const { arbitrum, base, vaultData } = useYieldData();

    const apy = chain === 'arbitrum' ? arbitrum.apy : base.apy;

    // Find timestamp from vaultData
    const chainSelector = chain === 'arbitrum' ? 3478487238524512106n : 10344971235874465080n;
    const timestampIdx = vaultData?.[0].findIndex(s => s === chainSelector);
    const lastUpdate = timestampIdx !== undefined && timestampIdx !== -1 ? Number(vaultData![2][timestampIdx]) : Math.floor(Date.now() / 1000);
    const isStale = (Date.now() / 1000 - lastUpdate) > 7200; // 2 hours

    // Simplified skeleton placeholder for initial load if needed
    // However, to satisfy the requirement of "image doesn't disappear", we render the full UI with skeleton states
    const isFetching = isLoading;

    return (
        <div className={`bg-bg-surface border border-border rounded-lg p-6 flex flex-col hover:border-border-accent transition-all duration-300 ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-transform ${isLoading ? 'scale-90 opacity-50' : 'scale-100'} ${chain === 'arbitrum' ? 'bg-transparent' : 'bg-transparent'}`}>
                        <Image
                            src={chain === 'arbitrum' ? '/assets/arbitrum-arb-logo.svg' : '/assets/Base_square_blue.svg'}
                            alt={chain}
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-tight">
                            {chain === 'arbitrum' ? 'Arbitrum' : 'Base'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={isLoading ? 'stale' : (isStale ? 'stale' : 'active')}>
                                {isLoading ? 'SYNCING...' : (isStale ? 'STALE_DATA' : 'LIVE_FEED')}
                            </Badge>
                            <span className={`text-[10px] text-text-muted font-mono transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                {formatAge(lastUpdate)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`text-right transition-all ${isLoading ? 'blur-sm' : ''}`}>
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-0.5">Vault APY</div>
                    <div className="text-xl font-mono font-bold text-accent-teal">
                        {isLoading ? '--.--%' : formatAPY(apy || 0n)}
                    </div>
                </div>
            </div>

            <div className={`space-y-1 mb-8 transition-all ${isLoading ? 'blur-md' : ''}`}>
                <DataRow label="Total Assets" value={isLoading ? 'Calculating...' : formatAssets(totalAssets || 0n)} />
                <DataRow label="Your Deposit" value={isLoading ? 'Fetching...' : formatAssets(userBalance || 0n)} />
                <DataRow
                    label="Link Balance"
                    value={
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono">{isLoading ? '0.00' : (Number(linkBalance || 0n) / 1e18).toFixed(2)}</span>
                            <span className="text-[10px] text-text-muted">LINK</span>
                        </div>
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <GlowButton onClick={onWithdraw} variant="secondary" className="flex items-center justify-center gap-2">
                    Withdraw
                </GlowButton>
                <GlowButton onClick={onDeposit} className="flex items-center justify-center gap-2">
                    Deposit
                </GlowButton>
            </div>
        </div>
    );
};
