import { type PublicClient, type Address, type AbiItem } from "viem";

export interface GetLogsInChunksParams {
    client: PublicClient;
    address: Address;
    event: AbiItem;
    fromBlock: bigint;
    toBlock?: bigint;
    chunkSize?: bigint;
    maxLookback?: bigint;
}

/**
 * Fetches logs in chunks to avoid RPC limits (e.g., 10,000 block range limit).
 */
export async function getLogsInChunks({
    client,
    address,
    event,
    fromBlock,
    toBlock,
    chunkSize = BigInt(10000),
    maxLookback = BigInt(200000),
}: GetLogsInChunksParams) {
    const latestBlock = toBlock || (await client.getBlockNumber());

    // Safety: don't look back further than maxLookback from latestBlock if fromBlock is too old
    let startBlock = fromBlock;
    if (latestBlock - fromBlock > maxLookback) {
        startBlock = latestBlock - maxLookback;
    }

    const logs = [];
    let currentFrom = startBlock;

    while (currentFrom <= latestBlock) {
        let currentTo = currentFrom + chunkSize - BigInt(1);
        if (currentTo > latestBlock) {
            currentTo = latestBlock;
        }

        const chunk = await client.getLogs({
            address,
            event: event as any,
            fromBlock: currentFrom,
            toBlock: currentTo,
        });

        logs.push(...chunk);

        if (currentTo === latestBlock) break;
        currentFrom = currentTo + BigInt(1);
    }

    return logs;
}
