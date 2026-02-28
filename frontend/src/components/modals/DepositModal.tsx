"use client";

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { CONTRACTS, VAULT_MANAGER_ABI, ERC20_ABI } from '@/lib/contracts';
import { formatUnits, parseUnits } from 'viem';
import { GlowButton } from '@/components/ui/GlowButton';
import { X, Loader2, Info, ArrowRight, Coins, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    chain: 'arbitrum' | 'base';
}

export const DepositModal = ({ isOpen, onClose, chain }: DepositModalProps) => {
    const { address } = useAccount();
    const currentChainId = useChainId();
    const [amount, setAmount] = useState('');
    const contract = CONTRACTS[chain];

    const isWrongChain = currentChainId !== contract.chainId;

    // Read BNM Balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: contract.ccipBnM as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        chainId: contract.chainId,
    });

    // Read Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: contract.ccipBnM as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, contract.vaultManager as `0x${string}`] : undefined,
        chainId: contract.chainId,
    });

    const { writeContract, data: hash, isPending: isWritePending, reset: resetWrite } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const [txStep, setTxStep] = useState<'idle' | 'approving' | 'depositing'>('idle');

    const needsApproval = allowance !== undefined && amount ? (allowance as bigint) < parseUnits(amount, 18) : true;

    const handleAction = () => {
        if (!amount || !address) return;
        const parsedAmount = parseUnits(amount, 18);

        if (needsApproval) {
            setTxStep('approving');
            writeContract({
                address: contract.ccipBnM as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [contract.vaultManager as `0x${string}`, parsedAmount],
            });
        } else {
            setTxStep('depositing');
            writeContract({
                address: contract.vaultManager as `0x${string}`,
                abi: VAULT_MANAGER_ABI,
                functionName: 'deposit',
                args: [parsedAmount],
            });
        }
    };

    useEffect(() => {
        if (isSuccess) {
            refetchBalance();
            refetchAllowance();

            if (txStep === 'approving') {
                // Approval finished, now trigger deposit automatically
                const parsedAmount = parseUnits(amount, 18);
                setTxStep('depositing');
                // Reset write state to allow new transaction
                // Note: resetWrite() might be needed or just calling writeContract again
                writeContract({
                    address: contract.vaultManager as `0x${string}`,
                    abi: VAULT_MANAGER_ABI,
                    functionName: 'deposit',
                    args: [parsedAmount],
                });
            } else if (txStep === 'depositing') {
                setTxStep('idle');
                setAmount('');
            }
        }
    }, [isSuccess]);

    // Reset step if modal closes or amount changes
    useEffect(() => {
        if (!isOpen) {
            setTxStep('idle');
        }
    }, [isOpen]);

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
                                Deposit to {chain === 'arbitrum' ? 'Arbitrum' : 'Base'}
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
                                            <span>Amount</span>
                                            <span>Balance: {balance ? formatUnits(balance as bigint, 18) : '0'}</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-bg-base border border-border rounded-md px-4 py-3 font-mono text-primary focus:outline-none focus:border-accent-teal transition-colors"
                                            />
                                            <button
                                                onClick={() => balance && setAmount(formatUnits(balance as bigint, 18))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-accent-teal hover:text-teal-300 uppercase tracking-widest"
                                            >
                                                Max
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-bg-elevated rounded-md space-y-2">
                                        <div className="flex justify-between text-[10px] text-text-muted font-mono uppercase">
                                            <span>Est. Shares</span>
                                            <span className="text-primary">{amount || '0'} shares</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-text-muted font-mono uppercase">
                                            <span>Asset</span>
                                            <span className="text-primary truncate max-w-[120px]">CCIP-BnM</span>
                                        </div>
                                    </div>

                                    {isSuccess && hash && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Success</p>
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
                                        onClick={handleAction}
                                        disabled={isWritePending || isConfirming || !amount || parseFloat(amount) <= 0}
                                        className="w-full py-4 text-sm font-bold uppercase tracking-[0.1em]"
                                    >
                                        {isWritePending || isConfirming ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>
                                                    {isConfirming
                                                        ? (txStep === 'approving' ? 'Confirming Approval...' : 'Confirming Deposit...')
                                                        : (txStep === 'approving' ? 'Signing Approval...' : 'Signing Deposit...')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span>Transact</span>
                                        )}
                                    </GlowButton>
                                </>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-bg-base/50 border-t border-border">
                            <div className="flex items-center gap-2 text-text-muted">
                                <Info className="w-3 h-3" />
                                <p className="text-[10px] italic">Deposits are bridged automatically if yield spreads expand.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
