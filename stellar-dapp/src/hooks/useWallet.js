import { useState, useCallback, useEffect } from 'react'
import { ERRORS, ERROR_MESSAGES } from '../utils/stellar'

// Freighter API wrapper
async function getFreighterAPI() {
  try {
    const freighter = await import('@stellar/freighter-api')
    return freighter
  } catch {
    return null
  }
}

export const WALLET_TYPES = {
  FREIGHTER: 'freighter',
  DEMO: 'demo',
  XBULL: 'xbull',
}

export const WALLET_INFO = {
  [WALLET_TYPES.FREIGHTER]: {
    name: 'Freighter',
    icon: '🔒',
    description: 'Official Stellar browser extension',
    color: '#9b59b6',
    downloadUrl: 'https://www.freighter.app/',
  },
  [WALLET_TYPES.DEMO]: {
    name: 'Demo Wallet',
    icon: '🧪',
    description: 'Built-in testnet demo wallet',
    color: '#00d4ff',
    downloadUrl: null,
  },
  [WALLET_TYPES.XBULL]: {
    name: 'xBull Wallet',
    icon: '🐂',
    description: 'Advanced Stellar wallet (simulated)',
    color: '#f39c12',
    downloadUrl: 'https://xbull.app/',
  },
}

// Demo wallet keypairs (Testnet only — public keys only shown)
const DEMO_ACCOUNTS = [
  {
    publicKey: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGXBWQNGM7PVLFE8J2EHPL',
    label: 'Demo Account #1',
    balance: '9850.4231547',
  },
  {
    publicKey: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
    label: 'Demo Account #2',
    balance: '247.1000000',
  },
]

export function useWallet() {
  const [wallet, setWallet] = useState(null) // { type, publicKey, label, balance }
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState(null)
  const [freighterAvailable, setFreighterAvailable] = useState(false)

  // Check Freighter availability
  useEffect(() => {
    const checkFreighter = async () => {
      const api = await getFreighterAPI()
      if (api) {
        try {
          const connected = await api.isConnected()
          setFreighterAvailable(!!connected)
        } catch {
          setFreighterAvailable(false)
        }
      }
    }
    checkFreighter()
  }, [])

  const connectFreighter = useCallback(async () => {
    setIsConnecting(true)
    setWalletError(null)
    try {
      const api = await getFreighterAPI()
      if (!api) {
        throw { type: ERRORS.WALLET_NOT_CONNECTED, message: 'Freighter extension not found. Please install it.' }
      }

      const connected = await api.isConnected()
      if (!connected) {
        throw { type: ERRORS.WALLET_NOT_CONNECTED, message: 'Freighter is installed but not connected.' }
      }

      await api.requestAccess()
      const publicKey = await api.getPublicKey()
      
      if (!publicKey) {
        throw { type: ERRORS.WALLET_NOT_CONNECTED, message: 'Could not get public key from Freighter.' }
      }

      // Fetch balance from Horizon
      const balance = await fetchBalance(publicKey)

      setWallet({
        type: WALLET_TYPES.FREIGHTER,
        publicKey,
        label: WALLET_INFO[WALLET_TYPES.FREIGHTER].name,
        balance,
      })
    } catch (err) {
      const message = err.message || ERROR_MESSAGES[ERRORS.WALLET_NOT_CONNECTED]
      setWalletError(message)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const connectDemo = useCallback(async (accountIndex = 0) => {
    setIsConnecting(true)
    setWalletError(null)
    try {
      // Simulate connection delay
      await new Promise(r => setTimeout(r, 800))
      const account = DEMO_ACCOUNTS[accountIndex]
      
      // Try to fetch real balance, fallback to mock
      let balance = account.balance
      try {
        balance = await fetchBalance(account.publicKey)
      } catch {
        // use mock balance
      }

      setWallet({
        type: WALLET_TYPES.DEMO,
        publicKey: account.publicKey,
        label: account.label,
        balance,
      })
    } catch (err) {
      setWalletError(err.message || 'Failed to connect demo wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const connectXBull = useCallback(async () => {
    setIsConnecting(true)
    setWalletError(null)
    try {
      await new Promise(r => setTimeout(r, 600))
      // xBull simulation — uses a synthetic public key
      const publicKey = 'GBVNNPOFVV2YNXSQXDJPBVQYY5GQBH77VLZ4GDQYQCSIQDMTF5CZQPD'
      const balance = '1823.5000000'

      setWallet({
        type: WALLET_TYPES.XBULL,
        publicKey,
        label: 'xBull Wallet',
        balance,
      })
    } catch (err) {
      setWalletError(err.message || 'Failed to connect xBull wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet(null)
    setWalletError(null)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!wallet) return
    try {
      const balance = await fetchBalance(wallet.publicKey)
      setWallet(prev => ({ ...prev, balance }))
    } catch {
      // silently fail
    }
  }, [wallet])

  return {
    wallet,
    isConnecting,
    walletError,
    freighterAvailable,
    connectFreighter,
    connectDemo,
    connectXBull,
    disconnect,
    refreshBalance,
    setWalletError,
  }
}

async function fetchBalance(publicKey) {
  try {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`)
    if (!response.ok) {
      if (response.status === 404) return '0.0000000' // unfunded account
      throw new Error('Horizon API error')
    }
    const data = await response.json()
    const nativeBal = data.balances?.find(b => b.asset_type === 'native')
    return nativeBal?.balance || '0.0000000'
  } catch {
    return '0.0000000'
  }
}
