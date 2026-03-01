# CrossYield — Frontend Agent Instructions

You are a senior frontend engineer building the CrossYield dashboard — a cross-chain DeFi yield optimizer powered by Chainlink CRE, CCIP, and Automation. This document is your complete specification. Read every section before writing a single line of code.

---

## Identity & Aesthetic Direction

CrossYield is infrastructure-grade DeFi tooling. The aesthetic must communicate **precision, trust, and real-time intelligence** — think Bloomberg Terminal meets Figma's design language. Not another purple-gradient Web3 startup.

**Commit to this direction:**
- Dark background (`#0A0B0E`) with subtle cool-gray surface layers
- Typography: `DM Mono` for data/numbers, `Sohne` or `Geist` for UI text — monospaced precision with clean readability
- Accent color: electric teal `#00E5C3` for active states, `#F5A623` for warnings, `#FF4D4D` for anomalies
- No gradients on primary backgrounds. Use gradients only for glow/shadow effects and chart fills
- Grid lines, dotted separators, subtle scan-line texture on data panels — referencing financial terminals
- Every number should feel alive — animate on update, pulse when fresh

**What makes this UNFORGETTABLE:** the yield differential visualization — a real-time "spread" between chains rendered as a live tension arc. When the spread is large enough to trigger rebalancing, the arc glows and pulses.

---

## Tech Stack

```
Framework    : Next.js 14 (App Router)
Styling      : Tailwind CSS + CSS Variables for tokens
Web3         : wagmi v2 + viem
Animation    : Framer Motion
Charts       : Recharts
State        : Zustand
Fonts        : DM Mono (Google Fonts), Geist (Vercel)
Icons        : Lucide React
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, font injection, providers
│   ├── page.tsx                # Dashboard home
│   └── globals.css             # CSS variables, base styles
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Chain selector + nav
│   │   └── TopBar.tsx          # Wallet connect + network status
│   ├── dashboard/
│   │   ├── YieldSpread.tsx     # Core visualization — yield tension arc
│   │   ├── VaultCard.tsx       # Per-chain vault stats card
│   │   ├── RebalanceHistory.tsx # Past CCIP rebalance events
│   │   ├── AutomationStatus.tsx # Chainlink Automation upkeep state
│   │   └── CREStatus.tsx       # CRE workflow last execution
│   ├── modals/
│   │   ├── DepositModal.tsx    # Deposit flow
│   │   └── WithdrawModal.tsx   # Withdraw flow
│   └── ui/
│       ├── Badge.tsx           # Status badges (active/paused/rebalancing)
│       ├── DataRow.tsx         # Labeled key-value row with live update flash
│       ├── GlowButton.tsx      # Primary CTA button with teal glow
│       └── LiveDot.tsx         # Animated pulse dot for live states
├── hooks/
│   ├── useVaultManager.ts      # Read VaultManager state on both chains
│   ├── useYieldData.ts         # Poll getAllYieldData() every 30s
│   ├── useCheckUpkeep.ts       # Poll checkUpkeep() and decode performData
│   ├── useCCIPMessage.ts       # Track CCIP message status by messageId
│   └── useRebalanceHistory.ts  # Parse RebalanceTriggered events
├── lib/
│   ├── contracts.ts            # ABI + address constants
│   ├── chains.ts               # wagmi chain config (ARB Sepolia + Base Sepolia)
│   ├── format.ts               # formatUnits, formatAPY, formatTimestamp
│   └── decode.ts               # Decode checkUpkeep performData bytes
└── providers/
    └── Web3Provider.tsx        # wagmi + viem provider setup
```

---

## Contract Constants

Paste this into `src/lib/contracts.ts` exactly:

```typescript
export const CONTRACTS = {
  arbitrum: {
    chainId: 421614,
    vaultManager: '0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66',
    consumer: '0xCCedf582BD0c94c68761A4Ab1Ee5445aA7E29642',
    mockAave: '0xe8b3d9eC032Cd7fbf3d0f6975384F8FD5f49C0d7',
    ccipBnM: '0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D',
    link: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
  },
  base: {
    chainId: 84532,
    vaultManager: '0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4',
    consumer: '0xe3521D9d8b0CF6de832bc23e3ED41b919Ec31647',
    mockAave: '0xF77216d1f04ADB76c633eb22F2686cF90aC6b0cA',
    ccipBnM: '0x88A2d74F47a237a62e7A51cdDa67270CE381555e',
  },
} as const

export const CHAIN_SELECTORS = {
  arbitrum: '3478487238524512106',
  base: '10344971235874465080',
} as const
```

---

## Key Contract ABIs

Only include functions you actually call. Keep ABIs minimal.

```typescript
// VaultManager — read functions you need
export const VAULT_MANAGER_ABI = [
  'function totalAssets() view returns (uint256)',
  'function getAllYieldData() view returns (uint64[], uint256[], uint256[])',
  'function checkUpkeep(bytes) view returns (bool, bytes)',
  'function cooldownRemaining() view returns (uint256)',
  'function getLinkBalance() view returns (uint256)',
  'function getUserSupplyBalance(address) view returns (uint256)',

  // Write
  'function deposit(uint256 amount)',
  'function withdraw(uint256 shares) returns (uint256)',
  'function resetCooldown()',

  // Events
  'event RebalanceTriggered(uint64 indexed targetChain, uint256 amount, bytes32 messageId)',
  'event YieldDataUpdated(uint64 indexed chainSelector, uint256 supplyRate, uint256 timestamp)',
  'event Deposit(address indexed user, uint256 assets, uint256 shares)',
] as const

export const MOCK_AAVE_ABI = [
  'function getSupplyAPY() view returns (uint256)',
  'function getUserSupplyBalance(address) view returns (uint256)',
] as const

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function drip(address to)', // CCIP-BnM faucet
] as const
```

---

## Page Layout Specification

### Root Layout
- Fixed sidebar (240px) on left
- TopBar (56px) fixed at top
- Main content area: full height scrollable with `padding: 24px`
- Background: `#0A0B0E` with a very subtle radial vignette

### Dashboard Grid (main content)

```
┌─────────────────────────────────────────────────────┐
│  YieldSpread                     (full width, 280px) │
├──────────────────────┬──────────────────────────────┤
│  VaultCard ARB       │  VaultCard BASE               │
│  (50%)               │  (50%)                        │
├──────────────────────┴──────────────────────────────┤
│  AutomationStatus    │  CREStatus                    │
│  (50%)               │  (50%)                        │
├─────────────────────────────────────────────────────┤
│  RebalanceHistory                (full width)        │
└─────────────────────────────────────────────────────┘
```

---

## Component Specifications

### YieldSpread.tsx

This is the hero component. It must:

1. Read `getSupplyAPY()` from MockAave on both chains via `useYieldData`
2. Display ARB APY on the left, BASE APY on the right
3. Render a curved SVG arc between them — the arc curves upward and its stroke color transitions from ARB accent to BASE accent
4. Arc stroke width scales with the delta: delta < 2% = thin gray, delta 2–10% = teal, delta > 10% = glowing teal with drop shadow pulse animation
5. Center of the arc shows the delta percentage in large monospace text
6. Below the arc: "Rebalancing active" badge with pulsing green dot when `checkUpkeep` returns true
7. Animate numbers with a smooth count-up on value change using Framer Motion

```typescript
// Arc glow keyframe — use this in CSS or Framer Motion
// When delta > REBALANCE_THRESHOLD (2%):
// box-shadow: 0 0 12px #00E5C3, 0 0 40px rgba(0,229,195,0.3)
// animate: opacity 0.8 → 1 → 0.8, duration 2s, repeat infinite
```

### VaultCard.tsx

Per-chain vault stats. Show:
- Chain name + logo (small icon)
- `totalAssets()` formatted as `X.XX CCIP-BnM`
- Current APY from `getSupplyAPY()`
- `getUserSupplyBalance(connectedWallet)` as "Your deposit"
- LINK balance via `getLinkBalance()`
- Deposit / Withdraw buttons (open respective modal on click)
- Last yield update timestamp (decode from `getAllYieldData()` timestamps — show as "X min ago")
- If timestamp > 2 hours old: show orange "Stale data" badge

### AutomationStatus.tsx

Show Chainlink Automation upkeep state:
- `checkUpkeep` result: "Ready to rebalance" (green) or "Monitoring" (gray)
- Decoded performData when upkeep is needed:
  - Target chain
  - Transfer amount
  - Estimated delta
- Cooldown remaining (from `cooldownRemaining()`) — show as countdown timer if > 0
- Link to automation.chain.link upkeep page

### CREStatus.tsx

Show last CRE execution:
- Last run timestamp (store in localStorage after each known run)
- Rates fetched: ARB X% / BASE X%
- Status: success / anomaly_detected
- Last 3 tx hashes with links to respective explorers

### RebalanceHistory.tsx

Parse `RebalanceTriggered` events from VaultManager ARB:
- Use `useRebalanceHistory` hook with `getLogs` via viem
- Show: timestamp, amount bridged, target chain, CCIP messageId
- Each row: clicking messageId opens `https://ccip.chain.link/msg/<id>` in new tab
- Status column: fetch CCIP status or show "Completed" for old events
- Animate new rows sliding in from top when a new event arrives

### DepositModal.tsx

Flow:
1. Show connected wallet CCIP-BnM balance
2. Amount input with MAX button
3. If allowance < amount: show "Approve" button first, then "Deposit"
4. Show estimated shares to receive
5. Show "Drip testnet tokens" button that calls `drip(address)` on CCIP-BnM contract
6. Transaction pending state with spinner
7. Success state with tx hash link

---

## Data Polling Strategy

Do not use websockets. Poll with `useInterval`:

```typescript
// Polling intervals
const INTERVALS = {
  yieldRates: 30_000,      // 30s — MockAave APY changes rarely
  vaultState: 15_000,      // 15s — totalAssets, user balance
  checkUpkeep: 20_000,     // 20s — automation readiness
  rebalanceEvents: 60_000, // 60s — historical events
} as const
```

When a value updates, flash the element briefly:
```css
@keyframes dataFlash {
  0%   { background: rgba(0, 229, 195, 0.15); }
  100% { background: transparent; }
}
/* Apply for 600ms on value change */
```

---

## Number Formatting Rules

```typescript
// src/lib/format.ts

// APY: 80000000000000000n → "8.00%"
export const formatAPY = (raw: bigint): string =>
  `${(Number(raw) / 1e16).toFixed(2)}%`

// Assets: 1000000000000000000n → "1.0000 CCIP-BnM"
export const formatAssets = (raw: bigint): string =>
  `${parseFloat(formatUnits(raw, 18)).toFixed(4)} CCIP-BnM`

// Delta: show with sign and color class
export const formatDelta = (a: bigint, b: bigint): string => {
  const delta = (Number(b) - Number(a)) / 1e16
  return `${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`
}

// Timestamp: 1772290557 → "3 min ago"
export const formatAge = (timestamp: number): string => {
  const diff = Date.now() / 1000 - timestamp
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Cooldown: 86271 seconds → "23h 57m"
export const formatCooldown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
```

---

## Wallet & Chain Config

```typescript
// src/lib/chains.ts
import { defineChain } from 'viem'

export const arbitrumSepolia = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
})

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
})
```

Configure wagmi to support both chains simultaneously. The dashboard reads from both chains at all times regardless of which chain the wallet is connected to.

---

## CSS Variables

```css
/* src/app/globals.css */
:root {
  --bg-base: #0A0B0E;
  --bg-surface: #111318;
  --bg-elevated: #1A1D24;
  --bg-hover: #222630;

  --border: rgba(255, 255, 255, 0.06);
  --border-accent: rgba(0, 229, 195, 0.3);

  --text-primary: #F0F2F5;
  --text-secondary: #8B8FA8;
  --text-muted: #4A4D60;

  --accent-teal: #00E5C3;
  --accent-teal-dim: rgba(0, 229, 195, 0.15);
  --accent-orange: #F5A623;
  --accent-red: #FF4D4D;

  --font-mono: 'DM Mono', monospace;
  --font-ui: 'Geist', sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

---

## Interaction & Motion Rules

1. **Page load**: Stagger dashboard cards with `animation-delay` 0ms, 80ms, 160ms, 240ms. Use `opacity: 0 → 1` + `translateY(8px) → 0`.
2. **Number updates**: When a polled value changes, trigger the `dataFlash` animation on the containing element.
3. **Buttons**: Scale `0.97` on active. Teal glow on hover for primary actions.
4. **Modals**: Slide up from bottom with backdrop blur. Not center-screen fade-in.
5. **Rebalance arc**: When `checkUpkeep` flips to true, animate the arc stroke from gray to teal over 800ms.
6. **No gratuitous animation**: Every animation must communicate state change or guide attention. No spinning logos, no ambient particle effects.

---

## Error & Loading States

Every async data point must have three states:

```typescript
type DataState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }
```

Loading state: show a subtle shimmer skeleton — gray bar, `background: linear-gradient(90deg, #1A1D24 25%, #222630 50%, #1A1D24 75%)` animated left to right.

Error state: show inline red text with a retry button. Never crash the whole dashboard for one failed RPC call.

---

## Accessibility Requirements

- All interactive elements must have `aria-label`
- Color is never the only indicator — pair with icon or text
- Keyboard navigable modals with focus trap
- Minimum contrast ratio 4.5:1 for all text
- `prefers-reduced-motion`: disable all animations when set

---

## What NOT to Do

- Do not use Inter, Roboto, or system fonts anywhere
- Do not use purple gradients or generic "web3 blue"
- Do not show raw wei values to users — always format
- Do not poll more than once per 10 seconds for any single value
- Do not show a loading spinner for the entire page — load sections independently
- Do not use `alert()` or `console.log` in production code
- Do not hardcode RPC URLs in components — use the chain config
- Do not assume wallet is connected — handle disconnected state gracefully
- Do not ignore the case where a user is on the wrong network

---

## Definition of Done

Before considering the frontend complete, verify:

- [ ] YieldSpread arc renders correctly with live data from both chains
- [ ] VaultCard shows correct `totalAssets` and user balance on both chains
- [ ] Deposit flow works end-to-end: drip → approve → deposit → success state
- [ ] `checkUpkeep` polling works and badge updates when rebalance is ready
- [ ] RebalanceHistory shows at least the last rebalance with correct messageId link
- [ ] All number formatting is correct (APY %, assets with 4 decimals, age timestamps)
- [ ] Stale data warning appears when yield data timestamp > 2 hours
- [ ] All loading and error states are implemented
- [ ] Mobile responsive at 375px, 768px, 1280px breakpoints
- [ ] No TypeScript errors, no ESLint warnings