import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { chains } from "@/config/contracts";
import { ponderClient } from "@/lib/ponder";
import { GET_ACTIVITY_LOGS } from "@/lib/graphql/queries";

export type ActivityLogType = "deposit" | "rebalance" | "oracle";

export interface ActivityLogItem {
    id: string;
    time: string;
    timestamp: number;
    type: ActivityLogType;
    message: string;
    tx: string;
    status: "completed" | "info";
    chain: string;
}

function formatTime(timestamp: number) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function getChainName(selector: string) {
    if (selector === chains.arbitrumSepolia.selector) return "Arbitrum";
    if (selector === chains.baseSepolia.selector) return "Base";
    return "Unknown Chain";
}

export function useActivityLogs(userAddress?: string) {
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true);
            try {
                const data: any = await ponderClient.request(GET_ACTIVITY_LOGS, {
                    limit: 50,
                    user: userAddress?.toLowerCase() || undefined,
                });

                const allLogs: ActivityLogItem[] = [
                    ...data.deposit_events.items.map((item: any) => ({
                        id: item.id,
                        time: formatTime(Number(item.timestamp)),
                        timestamp: Number(item.timestamp),
                        type: "deposit" as const,
                        message: `New Deposit: ${formatUnits(BigInt(item.amount), 6)} USDC received on ${item.chain}`,
                        tx: item.txHash,
                        status: "completed" as const,
                        chain: item.chain,
                    })),
                    ...data.withdraw_events.items.map((item: any) => ({
                        id: item.id,
                        time: formatTime(Number(item.timestamp)),
                        timestamp: Number(item.timestamp),
                        type: "deposit" as const,
                        message: `Withdrawal: ${formatUnits(BigInt(item.amount), 6)} USDC from ${item.chain}`,
                        tx: item.txHash,
                        status: "completed" as const,
                        chain: item.chain,
                    })),
                    ...data.rebalance_triggereds.items.map((item: any) => ({
                        id: item.id,
                        time: formatTime(Number(item.timestamp)),
                        timestamp: Number(item.timestamp),
                        type: "rebalance" as const,
                        message: `CCIP Rebalance: ${formatUnits(BigInt(item.amount), 18)} moved from ${item.chain} to ${item.targetChain}`,
                        tx: item.txHash,
                        status: "completed" as const,
                        chain: item.chain,
                    })),
                    ...data.yield_snapshots.items.map((item: any) => ({
                        id: item.id,
                        time: formatTime(Number(item.timestamp)),
                        timestamp: Number(item.timestamp),
                        type: "oracle" as const,
                        message: `CRE Decision: ${item.chain} yield updated to ${(Number(item.supplyRate) / 1e16).toFixed(2)}%.`,
                        tx: item.txHash,
                        status: "info" as const,
                        chain: item.chain,
                    })),
                ];

                setLogs(allLogs.sort((a, b) => b.timestamp - a.timestamp));
            } catch (error) {
                console.error("Error fetching logs from indexer:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLogs();
    }, [userAddress]);

    return { logs, isLoading };
}
