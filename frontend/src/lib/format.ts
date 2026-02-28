import { formatUnits } from 'viem'

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
