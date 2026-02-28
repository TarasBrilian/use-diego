"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { CONTRACTS, ERC20_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";
import { Coins, Loader2, ExternalLink, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

export default function FaucetPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState<string | undefined>();

    const getChainKey = () => {
        if (chainId === 421614) return 'arbitrum';
        if (chainId === 84532) return 'base';
        return null;
    };

    const chainKey = getChainKey();
    const usdcAddress = chainKey ? CONTRACTS[chainKey].ccipBnM : undefined;

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!usdcAddress,
        }
    });

    const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();

    const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleMint = () => {
        if (!address || !usdcAddress) return;
        setStatus("minting");
        writeContract({
            address: usdcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "drip",
            args: [address],
        });
    };

    useEffect(() => {
        if (isTxSuccess) {
            setStatus("success");
            setTxHash(hash);
            refetchBalance();
        }
    }, [isTxSuccess, hash, refetchBalance]);

    useEffect(() => {
        if (writeError) {
            setStatus("error");
        }
    }, [writeError]);

    return (
        <div className="flex min-h-screen bg-bg-base">
            <Sidebar />
            <div className="flex-1 ml-[240px]">
                <TopBar />
                <main className="pt-[56px] p-6">
                    <div className="max-w-4xl mx-auto py-12">
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-teal-dim rounded-full border border-border-accent mb-6">
                                <Coins className="w-4 h-4 text-accent-teal" />
                                <span className="text-[10px] font-mono font-bold text-accent-teal uppercase tracking-widest">Testnet Faucet</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
                                CCIP-BnM <span className="text-accent-teal">Faucet</span>
                            </h1>
                            <p className="text-text-secondary font-mono text-sm max-w-lg leading-relaxed">
                                Get CCIP-BnM test tokens to interact with CrossYield vaults on Arbitrum and Base Sepolia.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-bg-surface border border-border rounded-lg p-8 shadow-2xl relative overflow-hidden group">
                                <div className="flex flex-col gap-8 relative">
                                    <div>
                                        <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mb-1">Target Network</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                                            <span className="text-xl font-mono font-bold text-primary italic uppercase">
                                                {chainId === 421614 ? 'Arbitrum Sepolia' : chainId === 84532 ? 'Base Sepolia' : 'Unsupported'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-bg-elevated rounded-lg border border-border">
                                        <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mb-2">Current Balance</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-mono font-bold text-emerald-400">
                                                {balance !== undefined ? Number(formatUnits(balance as bigint, 18)).toLocaleString() : "0.00"}
                                            </span>
                                            <span className="text-xs font-mono text-text-muted uppercase">CCIP-BnM</span>
                                        </div>
                                    </div>

                                    {!isConnected ? (
                                        <div className="p-4 bg-accent-orange/10 border border-accent-orange/20 rounded-md flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-accent-orange" />
                                            <p className="text-sm font-medium text-accent-orange/90 italic">Connect your wallet to access the faucet.</p>
                                        </div>
                                    ) : (
                                        <GlowButton
                                            onClick={handleMint}
                                            disabled={status === "minting" || isWritePending || isWaitingForTx || !chainKey}
                                            className="w-full py-4 font-bold uppercase tracking-wider"
                                        >
                                            {(status === "minting" || isWritePending || isWaitingForTx) ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Drip Tokens</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            )}
                                        </GlowButton>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {status === "success" && (
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <h3 className="font-bold text-primary uppercase italic tracking-wider">Transaction Successful</h3>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-6 italic leading-relaxed">
                                            Test tokens have been sent to your wallet. You can now deposit them into the Yield Optimizer.
                                        </p>
                                        <a
                                            href={`${chainId === 421614 ? 'https://sepolia.arbiscan.io' : 'https://sepolia.basescan.org'}/tx/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent-teal hover:underline uppercase"
                                        >
                                            View Explorer
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="p-6 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertCircle className="w-5 h-5 text-accent-red" />
                                            <h3 className="font-bold text-primary uppercase italic tracking-wider">Error</h3>
                                        </div>
                                        <p className="text-sm text-accent-red/90 italic">Something went wrong. Please check your network or try again.</p>
                                    </div>
                                )}

                                <div className="p-6 bg-bg-surface border border-border rounded-lg">
                                    <h3 className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Contract Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-mono uppercase mb-1">Token Address</p>
                                            <code className="text-[10px] text-accent-teal/80 bg-bg-base p-2 rounded block border border-border break-all font-mono">
                                                {usdcAddress || "Switch to Arb/Base Sepolia"}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
