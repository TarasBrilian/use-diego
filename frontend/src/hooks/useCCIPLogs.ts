import { useEffect, useState, useMemo } from "react";
import { getLogsInChunks } from "@/lib/viem-utils";
import { usePublicClient } from "wagmi";
import { parseAbiItem, type Address } from "viem";
import { chains } from "@/config/contracts";
import { arbitrumSepolia, baseSepolia } from "viem/chains";

export interface CCIPLogEntry {
    id: string;
    timestamp: number;
    originChain: "Arbitrum" | "Base";
    targetChain: string;
    amount: bigint;
    messageId: `0x${string}`;
    txHash: `0x${string}`;
}

const REBALANCE_TRIGGERED_EVENT = parseAbiItem(
    "event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)"
);

const ARB_START_BLOCK = 246377898n;
const BASE_START_BLOCK = 38346071n;

export function useCCIPLogs(pageSize: number = 4) {
    const [allLogs, setAllLogs] = useState<CCIPLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);

    const arbClient = usePublicClient({ chainId: arbitrumSepolia.id });
    const baseClient = usePublicClient({ chainId: baseSepolia.id });

    const getChainName = (selector: string) => {
        if (selector === chains.arbitrumSepolia.selector) return "Arbitrum Sepolia";
        if (selector === chains.baseSepolia.selector) return "Base Sepolia";
        return "Unknown Chain";
    };

    useEffect(() => {
        async function fetchLogs() {
            if (!arbClient || !baseClient) return;

            setIsLoading(true);
            try {
                const [arbLogs, baseLogs] = await Promise.all([
                    getLogsInChunks({
                        client: arbClient,
                        address: chains.arbitrumSepolia.vaultManager as Address,
                        event: REBALANCE_TRIGGERED_EVENT,
                        fromBlock: ARB_START_BLOCK,
                    }),
                    getLogsInChunks({
                        client: baseClient,
                        address: chains.baseSepolia.vaultManager as Address,
                        event: REBALANCE_TRIGGERED_EVENT,
                        fromBlock: BASE_START_BLOCK,
                    }),
                ]);

                const formattedArb = await Promise.all(
                    arbLogs.map(async (log: any) => {
                        const block = await arbClient.getBlock({ blockNumber: log.blockNumber });
                        return {
                            id: `${log.transactionHash}-${log.logIndex}`,
                            timestamp: Number(block.timestamp),
                            originChain: "Arbitrum" as const,
                            targetChain: getChainName(log.args.targetChain?.toString() || ""),
                            amount: log.args.amount || 0n,
                            messageId: log.args.messageId as `0x${string}`,
                            txHash: log.transactionHash as `0x${string}`,
                        };
                    })
                );

                const formattedBase = await Promise.all(
                    baseLogs.map(async (log: any) => {
                        const block = await baseClient.getBlock({ blockNumber: log.blockNumber });
                        return {
                            id: `${log.transactionHash}-${log.logIndex}`,
                            timestamp: Number(block.timestamp),
                            originChain: "Base" as const,
                            targetChain: getChainName(log.args.targetChain?.toString() || ""),
                            amount: log.args.amount || 0n,
                            messageId: log.args.messageId as `0x${string}`,
                            txHash: log.transactionHash as `0x${string}`,
                        };
                    })
                );

                const consolidated = [...formattedArb, ...formattedBase].sort(
                    (a, b) => b.timestamp - a.timestamp
                );

                setAllLogs(consolidated);
            } catch (error) {
                console.error("Error fetching CCIP logs:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLogs();
    }, [arbClient, baseClient]);

    const paginatedLogs = useMemo(() => {
        const start = page * pageSize;
        return allLogs.slice(start, start + pageSize);
    }, [allLogs, page, pageSize]);

    const hasNextPage = (page + 1) * pageSize < allLogs.length;
    const hasPrevPage = page > 0;

    return {
        logs: paginatedLogs,
        isLoading,
        page,
        setPage,
        hasNextPage,
        hasPrevPage,
        totalCount: allLogs.length,
    };
}
