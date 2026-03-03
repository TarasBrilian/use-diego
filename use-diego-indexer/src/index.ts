// src/index.ts
import { ponder } from "ponder:registry";
import {
    rebalanceTriggered,
    rebalanceReceived,
    depositEvent,
    withdrawEvent,
    yieldSnapshot,
    vaultState,
} from "ponder:schema";

const CHAIN_SELECTOR_MAP: Record<string, string> = {
    "3478487238524512106": "ARB",
    "10344971235874465080": "BASE",
}

const toChainName = (selector: bigint) =>
    CHAIN_SELECTOR_MAP[selector.toString()] ?? `UNKNOWN(${selector})`

ponder.on("VaultManagerArb:RebalanceTriggered", async ({ event, context }) => {
    const { targetChain, amount, messageId } = event.args

    await context.db.insert(rebalanceTriggered).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "ARB",
        targetChain: toChainName(targetChain),
        targetSelector: targetChain,
        amount,
        messageId,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
        ccipUrl: `https://ccip.chain.link/msg/${messageId}`,
    })
})

ponder.on("VaultManagerArb:RebalanceReceived", async ({ event, context }) => {
    const { sourceChain, amount } = event.args

    await context.db.insert(rebalanceReceived).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "ARB",
        sourceChain: toChainName(sourceChain),
        sourceSelector: sourceChain,
        amount,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerArb:Deposited", async ({ event, context }) => {
    const { user, amount, sharesIssued } = event.args

    await context.db.insert(depositEvent).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "ARB",
        user,
        amount,
        sharesIssued,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerArb:Withdrawn", async ({ event, context }) => {
    const { user, amount, sharesBurned } = event.args

    await context.db.insert(withdrawEvent).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "ARB",
        user,
        amount,
        sharesBurned,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerArb:YieldDataUpdated", async ({ event, context }) => {
    const { chainSelector, supplyRate, timestamp } = event.args

    await context.db.insert(yieldSnapshot).values({
        id: `ARB-${chainSelector}-${event.block.number}`,
        chain: "ARB",
        chainSelector,
        supplyRate,
        timestamp,
        blockNumber: event.block.number,
        txHash: event.transaction.hash,
    })

    await context.db
        .insert(vaultState)
        .values({
            id: "ARB",
            chain: "ARB",
            totalAssets: 0n,
            updatedAt: event.block.timestamp,
            blockNumber: event.block.number,
        })
        .onConflictDoUpdate({
            updatedAt: event.block.timestamp,
            blockNumber: event.block.number,
        })
})

ponder.on("VaultManagerBase:RebalanceTriggered", async ({ event, context }) => {
    const { targetChain, amount, messageId } = event.args

    await context.db.insert(rebalanceTriggered).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "BASE",
        targetChain: toChainName(targetChain),
        targetSelector: targetChain,
        amount,
        messageId,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
        ccipUrl: `https://ccip.chain.link/msg/${messageId}`,
    })
})

ponder.on("VaultManagerBase:RebalanceReceived", async ({ event, context }) => {
    const { sourceChain, amount } = event.args

    await context.db.insert(rebalanceReceived).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "BASE",
        sourceChain: toChainName(sourceChain),
        sourceSelector: sourceChain,
        amount,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerBase:Deposited", async ({ event, context }) => {
    const { user, amount, sharesIssued } = event.args

    await context.db.insert(depositEvent).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "BASE",
        user,
        amount,
        sharesIssued,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerBase:Withdrawn", async ({ event, context }) => {
    const { user, amount, sharesBurned } = event.args

    await context.db.insert(withdrawEvent).values({
        id: `${event.transaction.hash}-${event.log.logIndex}`,
        chain: "BASE",
        user,
        amount,
        sharesBurned,
        txHash: event.transaction.hash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
    })
})

ponder.on("VaultManagerBase:YieldDataUpdated", async ({ event, context }) => {
    const { chainSelector, supplyRate, timestamp } = event.args

    await context.db.insert(yieldSnapshot).values({
        id: `BASE-${chainSelector}-${event.block.number}`,
        chain: "BASE",
        chainSelector,
        supplyRate,
        timestamp,
        blockNumber: event.block.number,
        txHash: event.transaction.hash,
    })
})