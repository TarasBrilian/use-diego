// ponder.schema.ts
import { onchainTable, index } from "ponder";

export const rebalanceTriggered = onchainTable(
  "rebalance_triggered",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    targetChain: t.text().notNull(),
    targetSelector: t.bigint().notNull(),
    amount: t.bigint().notNull(),
    messageId: t.hex().notNull(),
    txHash: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    ccipUrl: t.text().notNull(),
  }),
  (table) => ({
    timestampIdx: index().on(table.timestamp),
    chainIdx: index().on(table.chain),
  })
);

export const rebalanceReceived = onchainTable(
  "rebalance_received",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    sourceChain: t.text().notNull(),
    sourceSelector: t.bigint().notNull(),
    amount: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    timestampIdx: index().on(table.timestamp),
  })
);

export const depositEvent = onchainTable(
  "deposit_event",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    user: t.hex().notNull(),
    amount: t.bigint().notNull(),
    sharesIssued: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    userIdx: index().on(table.user),
    timestampIdx: index().on(table.timestamp),
  })
);

export const withdrawEvent = onchainTable(
  "withdraw_event",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    user: t.hex().notNull(),
    amount: t.bigint().notNull(),
    sharesBurned: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    userIdx: index().on(table.user),
    timestampIdx: index().on(table.timestamp),
  })
);

export const yieldSnapshot = onchainTable(
  "yield_snapshot",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    chainSelector: t.bigint().notNull(),
    supplyRate: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    chainIdx: index().on(table.chain),
    timestampIdx: index().on(table.timestamp),
    selectorIdx: index().on(table.chainSelector),
  })
);

export const vaultState = onchainTable(
  "vault_state",
  (t) => ({
    id: t.text().primaryKey(),
    chain: t.text().notNull(),
    totalAssets: t.bigint().notNull(),
    updatedAt: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
  })
);