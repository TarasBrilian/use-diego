# CrossYield — End-to-End Demo Guide

CrossYield is a cross-chain yield optimizer that automatically moves liquidity from lower-yield chains to higher-yield chains using Chainlink CRE, CCIP, and Automation.

---

## Architecture Overview

```
CRE Workflow (cron trigger)
    │
    ├── Read supplyRate from MockAave on each chain
    ├── Detect anomaly (rate > 50%)
    └── Send report to UseDiegoConsumer via Forwarder
            │
            └── updateYieldData() → VaultManager
                        │
                        └── Chainlink Automation
                                │
                                checkUpkeep() → true if delta > 2% and breakeven < 14 days
                                        │
                                        performUpkeep()
                                                │
                                                withdraw from MockAave
                                                        │
                                                        CCIP Bridge (ARB → BASE)
                                                                │
                                                                _ccipReceive() → supply to MockAave BASE
```

---

## Contract Addresses

### Arbitrum Sepolia
| Contract | Address |
|---|---|
| VaultManager | `0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66` |
| UseDiegoConsumer | `0xCCedf582BD0c94c68761A4Ab1Ee5445aA7E29642` |
| MockAAVEV3 | `0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7` |
| CCIP-BnM (USDC) | `0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D` |
| LINK Token | `0xb1D4538B4571d411F07960EF2838Ce337FE1E80E` |
| Automation Forwarder | `0x53b86167c4658b77132c6481b91faB09C3af72C9` |

### Base Sepolia
| Contract | Address |
|---|---|
| VaultManager | `0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4` |
| UseDiegoConsumer | `0xe3521D9d8b0CF6de832bc23e3ED41b919Ec31647` |
| MockAAVEV3 | `0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA` |
| CCIP-BnM (USDC) | `0x88A2d74F47a237a62e7A51cdDa67270CE381555e` |

---

## Prerequisites

Make sure `.env` contains:

```dotenv
RPC_URL_ARB=<arbitrum_sepolia_rpc>
RPC_URL_BASE=<base_sepolia_rpc>
PRIVATE_KEY=<deployer_private_key>
```

---

## Step 1 — Set Yield Rate Differential

Set Base rate higher than Arbitrum to trigger rebalancing.

```bash
# Set Arbitrum MockAave rate to 8%
cast send 0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7 \
  "setRates(uint256,uint256)" \
  80000000000000000 80000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Set Base MockAave rate to 20%
cast send 0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA \
  "setRates(uint256,uint256)" \
  200000000000000000 200000000000000000 \
  --rpc-url $RPC_URL_BASE --private-key $PRIVATE_KEY
```

Verify:
```bash
cast call 0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7 "getSupplyAPY()" --rpc-url $RPC_URL_ARB
# expect: 0x011c37937e080000 (8%)

cast call 0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA "getSupplyAPY()" --rpc-url $RPC_URL_BASE
# expect: 0x02c68af0bb140000 (20%)
```

---

## Step 2 — Deposit into VaultManager Arbitrum

Mint CCIP-BnM and deposit into VaultManager so there are funds to rebalance.

```bash
# Mint CCIP-BnM (free faucet)
cast send 0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D \
  "drip(address)" <YOUR_WALLET> \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Approve VaultManager
cast send 0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D \
  "approve(address,uint256)" \
  0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  1000000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Deposit 1 CCIP-BnM
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "deposit(uint256)" 1000000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY
```

Verify balance in MockAave:
```bash
cast call 0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7 \
  "getUserSupplyBalance(address)" \
  0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  --rpc-url $RPC_URL_ARB
```

---

## Step 3 — Run CRE Workflow Simulation

CRE reads yield rates from both chains and sends reports to UseDiegoConsumer.

```bash
cd use-diego-cre
cre workflow simulate use-diego-workflow --target staging-settings --broadcast
```

Expected output:
```
ethereum-testnet-sepolia-arbitrum-1: 8%
ethereum-testnet-sepolia-base-1: 20%
chainsUpdated: 2
status: success
```

> **Note:** CRE simulation forwarder does not propagate to VaultManager directly. Proceed to Step 4 to update yield data manually.

---

## Step 4 — Update Yield Data in VaultManager

Because simulation forwarder does not call UseDiegoConsumer on-chain, update yield data manually.

```bash
# Temporarily set creOperator to deployer wallet
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "setCreOperator(address)" <YOUR_WALLET> \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Update ARB rate on VaultManager ARB
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "updateYieldData(uint64,uint256)" \
  3478487238524512106 80000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Update BASE rate on VaultManager ARB
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "updateYieldData(uint64,uint256)" \
  10344971235874465080 200000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Restore creOperator to UseDiegoConsumer
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "setCreOperator(address)" \
  0xCCedf582BD0c94c68761A4Ab1Ee5445aA7E29642 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY
```

---

## Step 5 — Verify checkUpkeep Returns True

```bash
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "checkUpkeep(bytes)" 0x --rpc-url $RPC_URL_ARB
```

First word of output must be `0x0000...0001` (true). If false, check:
- Yield data timestamp not stale (within 2 hours) — repeat Step 3 and 4
- Balance in MockAave > 0 — repeat Step 2
- Cooldown not active — run `resetCooldown()` if needed

```bash
# Check cooldown remaining
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "cooldownRemaining()" --rpc-url $RPC_URL_ARB

# Reset cooldown if needed (owner only)
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "resetCooldown()" \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY
```

---

## Step 6 — Trigger Rebalancing

### Option A — Wait for Chainlink Automation (recommended)

Automation is already registered and active. Once `checkUpkeep` returns true, Automation will call `performUpkeep` automatically within a few minutes.

Monitor at: https://automation.chain.link/arbitrum-sepolia

### Option B — Trigger Manually (for demo)

```bash
# Get performData from checkUpkeep output
PERFORM_DATA=$(cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "checkUpkeep(bytes)" 0x --rpc-url $RPC_URL_ARB)

# Reset automation forwarder temporarily
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "setAutomationForwarder(address)" \
  0x0000000000000000000000000000000000000000 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Trigger performUpkeep (replace PERFORM_DATA_BYTES with actual performData)
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "performUpkeep(bytes)" "<PERFORM_DATA_BYTES>" \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY

# Restore automation forwarder
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "setAutomationForwarder(address)" \
  0x53b86167c4658b77132c6481b91faB09C3af72C9 \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY
```

---

## Step 7 — Track CCIP Message

After `performUpkeep` succeeds, get the messageId from the transaction logs and track it:

```
https://ccip.chain.link/msg/<MESSAGE_ID>
```

Status will go from `Inflight` → `Success` within a few minutes.

---

## Step 8 — Verify Funds Received on Base

```bash
cast call 0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4 \
  "totalAssets()" --rpc-url $RPC_URL_BASE
```

Value should increase after CCIP message is finalized, confirming funds were bridged and supplied into MockAave on Base.

---

## Anomaly Detection Demo (Optional)

To demonstrate the emergency pause feature, set a rate above 50% threshold:

```bash
# Set anomalous rate on Base (>50%)
cast send 0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA \
  "setRates(uint256,uint256)" \
  600000000000000000 600000000000000000 \
  --rpc-url $RPC_URL_BASE --private-key $PRIVATE_KEY

# Run CRE simulation — it will detect anomaly and pause all vaults
cre workflow simulate use-diego-workflow --target staging-settings --broadcast
# Expected: status: paused, reason: anomaly_detected

# Unpause (owner only)
cast send 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 \
  "emergencyUnpause()" \
  --rpc-url $RPC_URL_ARB --private-key $PRIVATE_KEY
```

---

## Quick Reference — Key Commands

```bash
# Check yield rates
cast call 0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7 "getSupplyAPY()" --rpc-url $RPC_URL_ARB
cast call 0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA "getSupplyAPY()" --rpc-url $RPC_URL_BASE

# Check stored yield data in VaultManager
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 "getAllYieldData()" --rpc-url $RPC_URL_ARB

# Check upkeep status
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 "checkUpkeep(bytes)" 0x --rpc-url $RPC_URL_ARB

# Check LINK balance in VaultManager
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 "getLinkBalance()" --rpc-url $RPC_URL_ARB

# Check cooldown remaining
cast call 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66 "cooldownRemaining()" --rpc-url $RPC_URL_ARB

# Check total assets on Base after rebalance
cast call 0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4 "totalAssets()" --rpc-url $RPC_URL_BASE
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `checkUpkeep` returns false | Yield data stale (>2 hours) | Re-run Step 3 and 4 |
| `checkUpkeep` returns false | Balance is 0 | Deposit more CCIP-BnM (Step 2) |
| `CooldownActive` error | 24h cooldown not expired | Run `resetCooldown()` |
| `Unauthorized` on performUpkeep | automationForwarder is set | Reset to zero first |
| `UnsupportedToken` | Wrong token address | Use CCIP-BnM not custom ERC20 |
| `YieldDeltaTooLow` | Delta < 2% threshold | Increase rate differential (Step 1) |
| CRE tx success but VaultManager not updated | Simulation forwarder limitation | Update yield data manually (Step 4) |