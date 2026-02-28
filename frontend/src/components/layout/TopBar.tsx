"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { arbitrumSepolia, baseSepolia } from '@/lib/chains';
import { Badge } from '@/components/ui/Badge';
import { LiveDot } from '@/components/ui/LiveDot';

export const TopBar = () => {
    const { isConnected } = useAccount();
    const chainId = useChainId();

    const getNetworkStatus = () => {
        if (!isConnected) return <Badge variant="paused">Disconnected</Badge>;
        if (chainId === arbitrumSepolia.id || chainId === baseSepolia.id) {
            return (
                <div className="flex items-center gap-2">
                    <LiveDot status="active" />
                    <span className="text-xs font-mono text-emerald-400">Live</span>
                </div>
            );
        }
        return <Badge variant="stale">Wrong Network</Badge>;
    };

    return (
        <header className="fixed top-0 right-0 left-[240px] h-[56px] bg-bg-base/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-40">
            <div className="flex items-center gap-4">
                {getNetworkStatus()}
            </div>

            <div className="flex items-center gap-4">
                <ConnectButton
                    accountStatus="address"
                    chainStatus="icon"
                    showBalance={false}
                />
            </div>
        </header>
    );
};
