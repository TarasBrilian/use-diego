# Use Diego — CrossYield Vault

**Deposit once. Let the vault chase the best yield across chains.**

Use Diego is an autonomous cross-chain yield optimizer designed to fragmentation in DeFi yields. It enables users to deposit stablecoins once and benefit from automatic capital allocation to the chain offering the highest net yield, orchestrated via Chainlink CCIP and Automation.

---

## 🏗 System Architecture

The protocol is built with a modular architecture that separates intelligence, triggering, and execution layers.

```mermaid
graph TD
    subgraph "Intelligence Layer (Off-Chain)"
        CRE["Custom Runtime Engine (CRE)"]
        Yields["Cross-Chain Yield Data"]
    end

    subgraph "Trigger Layer (Chainlink)"
        Automation["Chainlink Automation"]
    end

    subgraph "Execution Layer (On-Chain)"
        Vault["VaultManager.sol"]
        Oracle["YieldOracle.sol"]
        CCIP["Chainlink CCIP"]
        Aave["Aave V3"]
    end

    Yields --> CRE
    CRE -- "Signs & Updates" --> Oracle
    Oracle -- "Conditions Met" --> Automation
    Automation -- "checkUpkeep/performUpkeep" --> Vault
    Vault -- "Withdraw/Bridge" --> CCIP
    CCIP -- "Receive/Deposit" --> Vault
    Vault -- "Yield Generation" --> Aave
```

### Core Components

| Layer | Component | Responsibility |
| :--- | :--- | :--- |
| **Intelligence** | **CRE** | Reads on-chain data, computes net profitability, and updates the Yield Oracle. |
| **Trigger** | **Chainlink Automation** | Monitors conditions and triggers rebalancing events autonomously. |
| **Execution** | **Smart Contracts** | Manages user funds, interacts with lending protocols, and handles cross-chain bridging. |

---

## 💡 The Core Innovation: Net Yield Optimization

Unlike basic yield aggregators that chase the highest gross APY, Use Diego calculates the **Net Yield** to ensure rebalancing is actually profitable.

$$
\text{Net Yield} = \text{Gross APY} - (\text{Bridge Cost} + \text{Gas Fees} + \text{Slippage})
$$

Rebalancing only occurs if:

$$
\Delta\text{Yield} \times \text{Capital} > \text{Total Rebalance Costs}
$$


---

## 🛠 Features & Flows

### 💰 One-Click Deposit
Users deposit USDC on any supported chain. The `VaultManager` issues proportional shares (receipt tokens) and immediately deploys the capital into local lending protocols (e.g., Aave).

### 🔄 Autonomous Rebalancing
When a significant yield opportunity is detected on another chain:
1. **Withdrawal**: Funds are pulled from the source chain lending pool.
2. **Bridging**: Capital is transferred via **Chainlink CCIP**.
3. **Deployment**: Target chain receives funds and deposits them into the local high-yield pool.
4. **State Sync**: Vault shares reflect the global unified liquidity.

### 🛡 Security & Trust Model
*   **Non-Custodial**: Funds are always held in audited-style smart contracts (prototype status), not by operator keys.
*   **Explicit Triggers**: Only authorized Chainlink Forwarders can execute rebalancing logic.
*   **Layered Trust**: While the `YieldOracle` currently relies on CRE-signed data, the execution path remains constrained by programmed logic.

## 📍 Deployed Addresses

### Arbitrum (Sepolia)
- **VaultManager**: `0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66`
- **Forwarder**: `0x53b86167c4658b77132c6481b91faB09C3af72C9`
- **USDC**: `0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D`
- **MockAaveV3**: `0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7`

### Base (Sepolia)
- **VaultManager**: `0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4`
- **Forwarder**: `0xdCD67F7b6b96f115fe1515bEd953d4031692685E`
- **USDC**: `0x88A2d74F47a237a62e7A51cdDa67270CE381555e`
- **MockAaveV3**: `0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA`

<details>
<summary>View Detailed Deployment Logs</summary>

```bash
# == Logs ARB ==
#   MockAAVEV3 deployed at: 0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7
#   VaultManager deployed at: 0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66
#   Forwarder deployed at: 0xcc61F37f20395755A01F37CE6320523a99746834
#   LinkToken address at: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E
#   Consumer address at: 0xCCedf582BD0c94c68761A4Ab1Ee5445aA7E29642

# == Logs BASE ==
#   MockAAVEV3 deployed at: 0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA
#   VaultManager deployed at: 0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4
#   Forwarder deployed at: 0x712e14843DD031cB47B203470E0942E5dcaAA05b
#   LinkToken address at: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410
#   Consumer address at: 0xe3521D9d8b0CF6de832bc23e3ED41b919Ec31647
```
</details>

---

## 🚀 Tech Stack

*   **Smart Contracts**: Solidity `^0.8.20`, Foundry/Hardhat.
*   **Orchestration**: Chainlink CCIP, Chainlink Automation v2.1.
*   **Lending Integration**: Aave V3.
*   **Off-chain Intelligence**: Custom Runtime Engine (CRE) - Node.js/TypeScript.
*   **Frontend**: Nextjs.

---

## 🔮 Roadmap
- [ ] Decentralized Oracle signing for yield data.
- [ ] Multi-protocol strategy expansion.
- [ ] Advanced slippage and price impact protection.
- [ ] Support for non-EVM chains via CCIP.