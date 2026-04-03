// Stellar Testnet Configuration
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
export const HORIZON_URL = 'https://horizon-testnet.stellar.org'
export const FRIENDBOT_URL = 'https://friendbot.stellar.org'

// Deployed Payment Tracker Contract Address (Testnet)
export const CONTRACT_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'

// Sample transaction hashes for demo
export const SAMPLE_TX_HASH = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'

// Error types
export const ERRORS = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
}

export const ERROR_MESSAGES = {
  [ERRORS.WALLET_NOT_CONNECTED]: 'No wallet connected. Please connect Freighter or Demo Wallet first.',
  [ERRORS.INSUFFICIENT_BALANCE]: 'Insufficient XLM balance. You need at least 1.5 XLM to cover transaction fees.',
  [ERRORS.TRANSACTION_FAILED]: 'Transaction failed on the Stellar network. Please try again.',
  [ERRORS.NETWORK_ERROR]: 'Network error connecting to Stellar Testnet. Check your internet connection.',
  [ERRORS.USER_REJECTED]: 'Transaction was rejected by the user.',
}

// Shorten a Stellar address or hash
export function shortenAddress(addr, chars = 6) {
  if (!addr) return ''
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

// Format XLM amount
export function formatXLM(amount) {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0 XLM'
  return `${num.toFixed(7)} XLM`
}

// Format timestamp
export function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date instanceof Date ? date : new Date(date))
}

// Generate random transaction hash for demo
export function generateMockHash() {
  const chars = '0123456789abcdef'
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('')
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Open in Stellar Expert (Testnet explorer)
export function openInExplorer(hash, type = 'tx') {
  const url = `https://stellar.expert/explorer/testnet/${type}/${hash}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Validate Stellar address
export function isValidStellarAddress(address) {
  return /^G[A-Z2-7]{55}$/.test(address)
}

// Convert stroops to XLM
export function stroopsToXLM(stroops) {
  return (parseInt(stroops) / 10_000_000).toFixed(7)
}

// Convert XLM to stroops
export function xlmToStroops(xlm) {
  return Math.round(parseFloat(xlm) * 10_000_000)
}
