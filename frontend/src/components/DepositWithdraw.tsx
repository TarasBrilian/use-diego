"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { vaultManagerAbi, erc20Abi, chains } from "@/config/contracts";
import { parseUnits, formatUnits } from "viem";
import { AlertCircle, CreditCard, Loader2, ShieldCheck } from "lucide-react";

export function DepositWithdraw() {
    const [amount, setAmount] = useState("");
    const [isDeposit, setIsDeposit] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const activeChain = Object.values(chains).find(c => c.id === chainId);

    const vaultAddress = activeChain?.vaultManager as `0x${string}`;
    const usdcAddress = activeChain?.usdc as `0x${string}`;

    // Read USDC Balance
    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
        query: { enabled: !!address },
    });

    // Read Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, vaultAddress],
        query: { enabled: !!address },
    });

    // Read User USDC Balance
    const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
        address: vaultAddress,
        abi: vaultManagerAbi,
        functionName: "getUserBalance",
        args: [address!],
        query: { enabled: !!address },
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isSuccess: isConfirmed, isLoading: isWaiting } = useWaitForTransactionReceipt({ hash });

    // Refetch data when transaction is confirmed
    useEffect(() => {
        if (isConfirmed && hash) {
            refetchBalance();
            refetchAllowance();
            refetchUserBalance();
            setSuccessTxHash(hash);
            setShowSuccess(true);
        }
    }, [isConfirmed, hash, refetchBalance, refetchAllowance, refetchUserBalance]);

    const handleAction = async () => {
        setShowSuccess(false); // Reset popup on new action
        if (!amount || !address) return;

        if (isDeposit) {
            const parsedAmount = parseUnits(amount, 6);
            if (!allowance || (allowance as bigint) < parsedAmount) {
                writeContract({
                    address: usdcAddress,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [vaultAddress, parsedAmount],
                });
            } else {
                writeContract({
                    address: vaultAddress,
                    abi: vaultManagerAbi,
                    functionName: "deposit",
                    args: [parsedAmount],
                });
            }
        } else {
            const parsedShares = parseUnits(amount, 6); // Assuming 1:1 for simplicity in demo UI
            writeContract({
                address: vaultAddress,
                abi: vaultManagerAbi,
                functionName: "withdraw",
                args: [parsedShares],
            });
        }
    };

    const needsApproval = isDeposit && amount && allowance !== undefined && (allowance as bigint) < parseUnits(amount, 6);

    if (!isConnected) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <CreditCard className="w-32 h-32" />
            </div>

            <div className="flex p-1 bg-slate-950 rounded-xl mb-8 w-fit border border-slate-800">
                <button
                    onClick={() => setIsDeposit(true)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${isDeposit ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Deposit
                </button>
                <button
                    onClick={() => setIsDeposit(false)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${!isDeposit ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Withdraw
                </button>
            </div>

            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount (USDC)</label>
                    <span className="text-xs text-slate-500 font-mono">
                        Balance: {isDeposit
                            ? (usdcBalance ? Number(formatUnits(usdcBalance as bigint, 6)).toLocaleString() : "0")
                            : (userBalance ? Number(formatUnits(userBalance as bigint, 6)).toLocaleString() : "0")}
                    </span>
                </div>
                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-800"
                    />
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase"
                        onClick={() => {
                            if (isDeposit) setAmount(formatUnits(usdcBalance as bigint, 6));
                            else setAmount(formatUnits(userBalance as bigint, 6));
                        }}
                    >
                        Max
                    </button>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-tight">Security Note</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Funds are managed by Diego CRE & CCIP. {isDeposit ? 'Deposits' : 'Withdrawals'} might take up to 20 minutes for cross-chain settlement.
                        </p>
                    </div>
                </div>
            </div>

            <button
                disabled={!amount || isPending || isWaiting}
                onClick={handleAction}
                className="w-full py-4 bg-slate-50 text-slate-950 rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
            >
                {(isPending || isWaiting) ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        {needsApproval ? 'Approve USDC' : (isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal')}
                    </>
                )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Protected by Diego Protocol</span>
            </div>

            {/* Success Popup */}
            {showSuccess && successTxHash && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Transaction Confirmed!</h4>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            Your transaction has been successfully processed on the blockchain.
                        </p>
                        <div className="space-y-3">
                            <a
                                href={`${activeChain?.id === 421614 ? 'https://sepolia.arbiscan.io' : 'https://sepolia.basescan.org'}/tx/${successTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all"
                            >
                                View on Explorer
                            </a>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="block w-full py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
