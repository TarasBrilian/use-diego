import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem, formatUnits, type Address, type Log } from "viem";
import { chains } from "@/config/contracts";
import { arbitrumSepolia, baseSepolia } from "viem/chains";

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

const DEPOSITED_EVENT = parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 sharesIssued)");
const WITHDRAWN_EVENT = parseAbiItem("event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned)");
const REBALANCE_TRIGGERED_EVENT = parseAbiItem("event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)");
const YIELD_DATA_UPDATED_EVENT = parseAbiItem("event YieldDataUpdated(uint64 indexed chainSelector, uint256 supplyRate, uint256 timestamp)");

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

    const arbClient = usePublicClient({ chainId: arbitrumSepolia.id });
    const baseClient = usePublicClient({ chainId: baseSepolia.id });

    useEffect(() => {
        async function fetchLogs() {
            if (!arbClient || !baseClient) return;

            setIsLoading(true);
            try {
                // Determine block ranges (limiting to last 50k blocks for performance/RPC limits)
                const [arbBlock, baseBlock] = await Promise.all([
                    arbClient.getBlockNumber(),
                    baseClient.getBlockNumber(),
                ]);

                const LOOKBACK = BigInt(50_000);
                const arbFrom = arbBlock > LOOKBACK ? arbBlock - LOOKBACK : BigInt(0);
                const baseFrom = baseBlock > LOOKBACK ? baseBlock - LOOKBACK : BigInt(0);

                const filterArgs = userAddress ? { user: userAddress as Address } : undefined;

                const [arbLogs, baseLogs] = await Promise.all([
                    Promise.all([
                        arbClient.getLogs({
                            address: chains.arbitrumSepolia.vaultManager as Address,
                            event: DEPOSITED_EVENT,
                            args: filterArgs,
                            fromBlock: arbFrom,
                        }),
                        arbClient.getLogs({
                            address: chains.arbitrumSepolia.vaultManager as Address,
                            event: WITHDRAWN_EVENT,
                            args: filterArgs,
                            fromBlock: arbFrom,
                        }),
                        arbClient.getLogs({
                            address: chains.arbitrumSepolia.vaultManager as Address,
                            event: REBALANCE_TRIGGERED_EVENT,
                            // RebalanceTriggered doesn't have a user index, so we fetch all
                            fromBlock: arbFrom,
                        }),
                        arbClient.getLogs({
                            address: chains.arbitrumSepolia.vaultManager as Address,
                            event: YIELD_DATA_UPDATED_EVENT,
                            fromBlock: arbFrom,
                        }),
                    ]),
                    Promise.all([
                        baseClient.getLogs({
                            address: chains.baseSepolia.vaultManager as Address,
                            event: DEPOSITED_EVENT,
                            args: filterArgs,
                            fromBlock: baseFrom,
                        }),
                        baseClient.getLogs({
                            address: chains.baseSepolia.vaultManager as Address,
                            event: WITHDRAWN_EVENT,
                            args: filterArgs,
                            fromBlock: baseFrom,
                        }),
                        baseClient.getLogs({
                            address: chains.baseSepolia.vaultManager as Address,
                            event: REBALANCE_TRIGGERED_EVENT,
                            fromBlock: baseFrom,
                        }),
                        baseClient.getLogs({
                            address: chains.baseSepolia.vaultManager as Address,
                            event: YIELD_DATA_UPDATED_EVENT,
                            fromBlock: baseFrom,
                        }),
                    ]),
                ]);

                const allEvents = [
                    ...arbLogs.flat().map(log => ({ ...log, chain: "Arbitrum" })),
                    ...baseLogs.flat().map(log => ({ ...log, chain: "Base" })),
                ];

                // Sort by block number DESC before fetching block timestamps to minimize requests if needed
                // But we need timestamps for the UI sorting anyway
                const logsWithTimestamps = await Promise.all(
                    allEvents.map(async (event) => {
                        const block = await (event.chain === "Arbitrum" ? arbClient : baseClient).getBlock({
                            blockNumber: event.blockNumber,
                        });
                        const timestamp = Number(block.timestamp);

                        let type: ActivityLogType = "deposit";
                        let message = "";
                        let status: "completed" | "info" = "completed";

                        if (event.eventName === "Deposited") {
                            type = "deposit";
                            const amount = formatUnits((event.args as any).amount, 6);
                            message = `New Deposit: ${amount} USDC received on ${event.chain}`;
                        } else if (event.eventName === "Withdrawn") {
                            type = "deposit"; // Using same type for simplicity in UI
                            const amount = formatUnits((event.args as any).amount, 6);
                            message = `Withdrawal: ${amount} USDC from ${event.chain}`;
                        } else if (event.eventName === "RebalanceTriggered") {
                            type = "rebalance";
                            const amount = formatUnits((event.args as any).amount, 18); // BnM is 18 decimals
                            const targetChain = getChainName((event.args as any).targetChain.toString());
                            message = `CCIP Rebalance: ${amount} moved from ${event.chain} to ${targetChain}`;
                        } else if (event.eventName === "YieldDataUpdated") {
                            type = "oracle";
                            const supplyRate = (Number((event.args as any).supplyRate) / 1e16).toFixed(2);
                            const targetChain = getChainName((event.args as any).chainSelector.toString());
                            message = `CRE Decision: ${targetChain} yield updated to ${supplyRate}%.`;
                            status = "info";
                        }

                        return {
                            id: `${event.transactionHash}-${event.logIndex}`,
                            time: formatTime(timestamp),
                            timestamp,
                            type,
                            message,
                            tx: event.transactionHash,
                            status,
                            chain: event.chain,
                        } as ActivityLogItem;
                    })
                );

                setLogs(logsWithTimestamps.sort((a, b) => b.timestamp - a.timestamp));
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLogs();
    }, [arbClient, baseClient, userAddress]);

    return { logs, isLoading };
}
