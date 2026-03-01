"use client";

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI } from '@/lib/contracts';
import { formatUnits, parseUnits } from 'viem';
import { GlowButton } from '@/components/ui/GlowButton';
import { X, Loader2, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    chain: 'arbitrum' | 'base';
}

export const WithdrawModal = ({ isOpen, onClose, chain }: WithdrawModalProps) => {
    const { address } = useAccount();
    const currentChainId = useChainId();
    const [shares, setShares] = useState('');
    const contract = CONTRACTS[chain];

    const isWrongChain = currentChainId !== contract.chainId;

    // Read User Balance (Shares)
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: contract.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'userShares',
        args: address ? [address] : undefined,
        chainId: contract.chainId,
    });

    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleAction = () => {
        if (!shares || !address) return;
        const parsedShares = parseUnits(shares, 18);

        writeContract({
            address: contract.vaultManager as `0x${string}`,
            abi: VAULT_MANAGER_ABI,
            functionName: 'withdraw',
            args: [parsedShares],
        });
    };

    useEffect(() => {
        if (isSuccess) {
            refetchBalance();
            setShares('');
        }
    }, [isSuccess]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative w-full max-w-md bg-bg-surface border border-border rounded-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-tight flex items-center gap-2">
                                Withdraw from {chain === 'arbitrum' ? 'Arbitrum' : 'Base'}
                            </h2>
                            <button onClick={onClose} className="text-text-muted hover:text-primary transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {isWrongChain ? (
                                <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-md text-accent-red text-sm italic">
                                    Wrong network. Please switch to {chain === 'arbitrum' ? 'Arbitrum Sepolia' : 'Base Sepolia'} in your wallet.
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] text-text-muted uppercase font-mono">
                                            <span>Shares to Withdraw</span>
                                            <span>Balance: {balance ? formatUnits(balance as bigint, 18) : '0'}</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                value={shares}
                                                onChange={(e) => setShares(e.target.value)}
                                                className="w-full bg-bg-base border border-border rounded-md px-4 py-3 font-mono text-primary focus:outline-none focus:border-accent-teal transition-colors"
                                            />
                                            <button
                                                onClick={() => balance && setShares(formatUnits(balance as bigint, 18))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-accent-teal hover:text-teal-300 uppercase tracking-widest"
                                            >
                                                Max
                                            </button>
                                        </div>
                                    </div>

                                    {isSuccess && hash && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Withdraw Processed</p>
                                            <a
                                                href={`${chain === 'arbitrum' ? 'https://sepolia.arbiscan.io' : 'https://sepolia.basescan.org'}/tx/${hash}`}
                                                target="_blank"
                                                className="text-xs text-accent-teal underline flex items-center gap-1 font-mono"
                                            >
                                                View Transaction <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}

                                    <GlowButton
                                        variant="danger"
                                        onClick={handleAction}
                                        disabled={isWritePending || isConfirming || !shares}
                                        className="w-full py-4 text-sm font-bold uppercase tracking-[0.1em]"
                                    >
                                        {isWritePending || isConfirming ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{isConfirming ? 'Processing Withdrawal...' : 'Signing Transaction...'}</span>
                                            </div>
                                        ) : (
                                            <span>Redeem Assets</span>
                                        )}
                                    </GlowButton>
                                </>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-bg-base/50 border-t border-border">
                            <div className="flex items-center gap-2 text-text-muted">
                                <Info className="w-3 h-3" />
                                <p className="text-[10px] italic">Withdrawing burns your vault shares and returns underlying assets.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
