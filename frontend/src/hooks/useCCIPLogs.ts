import { useEffect, useState, useMemo } from "react";
import { chains } from "@/config/contracts";
import { ponderClient } from "@/lib/ponder";
import { GET_CCIP_LOGS } from "@/lib/graphql/queries";

export interface CCIPLogEntry {
    id: string;
    timestamp: number;
    originChain: "Arbitrum" | "Base";
    targetChain: string;
    amount: bigint;
    messageId: `0x${string}`;
    txHash: `0x${string}`;
    ccipUrl?: string;
}

export function useCCIPLogs(pageSize: number = 4, userAddress?: string) {
    const [allLogs, setAllLogs] = useState<CCIPLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const getChainName = (selector: string) => {
        if (selector === chains.arbitrumSepolia.selector) return "Arbitrum Sepolia";
        if (selector === chains.baseSepolia.selector) return "Base Sepolia";
        return "Unknown Chain";
    };

    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true);
            try {
                const data: any = await ponderClient.request(GET_CCIP_LOGS, {
                    limit: pageSize * 5,
                    user: userAddress?.toLowerCase() || undefined,
                });

                console.log("CCIP Logs Raw Data:", data);

                if (!data.rebalanceTriggereds) {
                    console.warn("No rebalanceTriggereds field in response");
                    return;
                }

                const consolidated: CCIPLogEntry[] = data.rebalanceTriggereds.items.map((item: any) => ({
                    id: item.id,
                    timestamp: Number(item.timestamp),
                    originChain: item.chain === "BASE" ? "Base" : "Arbitrum",
                    targetChain: item.targetChain === "BASE" ? "Base" : "Arbitrum",
                    amount: BigInt(item.amount),
                    messageId: item.messageId as `0x${string}`,
                    txHash: item.txHash as `0x${string}`,
                    ccipUrl: item.ccipUrl,
                }));

                setAllLogs(consolidated);
                setTotalCount(consolidated.length);
            } catch (error) {
                console.error("Error fetching CCIP logs from indexer:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLogs();
    }, [pageSize]);

    const paginatedLogs = useMemo(() => {
        const start = page * pageSize;
        return allLogs.slice(start, start + pageSize);
    }, [allLogs, page, pageSize]);

    const hasNextPage = (page + 1) * pageSize < totalCount;
    const hasPrevPage = page > 0;

    return {
        logs: paginatedLogs,
        isLoading,
        page,
        setPage,
        hasNextPage,
        hasPrevPage,
        totalCount,
    };
}
