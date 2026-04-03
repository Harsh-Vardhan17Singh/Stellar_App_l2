import { useState, useCallback, useRef } from 'react'
import { ERRORS, ERROR_MESSAGES, generateMockHash, isValidStellarAddress } from '../utils/stellar'
import { WALLET_TYPES } from './useWallet'

export const TX_STATUS = {
  IDLE: 'idle',
  BUILDING: 'building',
  SIGNING: 'signing',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  FAILED: 'failed',
}

const MIN_BALANCE_XLM = 1.5 // base reserve + fee buffer

export function useTransaction(wallet, addEvent) {
  const [txStatus, setTxStatus] = useState(TX_STATUS.IDLE)
  const [txHash, setTxHash] = useState(null)
  const [txError, setTxError] = useState(null)
  const [txHistory, setTxHistory] = useState([])
  const abortRef = useRef(false)

  const resetTx = useCallback(() => {
    setTxStatus(TX_STATUS.IDLE)
    setTxHash(null)
    setTxError(null)
  }, [])

  const sendPayment = useCallback(async ({ destination, amount, memo }) => {
    // --- Error Guard 1: Wallet not connected ---
    if (!wallet) {
      const err = {
        type: ERRORS.WALLET_NOT_CONNECTED,
        message: ERROR_MESSAGES[ERRORS.WALLET_NOT_CONNECTED],
      }
      setTxError(err)
      addEvent({ type: 'error', message: err.message, code: err.type })
      return
    }

    // --- Error Guard 2: Insufficient balance ---
    const balance = parseFloat(wallet.balance || '0')
    const sendAmount = parseFloat(amount || '0')
    if (balance < sendAmount + MIN_BALANCE_XLM) {
      const err = {
        type: ERRORS.INSUFFICIENT_BALANCE,
        message: `${ERROR_MESSAGES[ERRORS.INSUFFICIENT_BALANCE]} (Available: ${balance.toFixed(2)} XLM, Required: ${(sendAmount + MIN_BALANCE_XLM).toFixed(2)} XLM)`,
      }
      setTxError(err)
      addEvent({ type: 'error', message: err.message, code: err.type })
      return
    }

    abortRef.current = false
    setTxError(null)
    setTxHash(null)

    try {
      // Phase 1: Building
      setTxStatus(TX_STATUS.BUILDING)
      addEvent({ type: 'info', message: `Building transaction: ${amount} XLM → ${destination.slice(0, 8)}...` })
      await delay(600)

      if (abortRef.current) return

      // Use real Stellar SDK for Freighter, simulate for others
      if (wallet.type === WALLET_TYPES.FREIGHTER) {
        await sendRealTransaction({ wallet, destination, amount, memo, setTxStatus, setTxHash, setTxError, addEvent })
      } else {
        await simulateTransaction({ wallet, destination, amount, memo, setTxStatus, setTxHash, setTxError, addEvent, txHistory, setTxHistory })
      }
    } catch (err) {
      const errorType = classifyError(err)
      const txErr = {
        type: errorType,
        message: err.message || ERROR_MESSAGES[errorType],
      }
      setTxError(txErr)
      setTxStatus(TX_STATUS.FAILED)
      addEvent({ type: 'error', message: txErr.message, code: txErr.type })
    }
  }, [wallet, addEvent, txHistory])

  const cancelTx = useCallback(() => {
    abortRef.current = true
    setTxStatus(TX_STATUS.IDLE)
    addEvent({ type: 'warn', message: 'Transaction cancelled by user' })
  }, [addEvent])

  return {
    txStatus,
    txHash,
    txError,
    txHistory,
    sendPayment,
    cancelTx,
    resetTx,
  }
}

// Real Stellar transaction using Horizon (for Freighter wallet)
async function sendRealTransaction({ wallet, destination, amount, memo, setTxStatus, setTxHash, setTxError, addEvent }) {
  try {
    const { Horizon, TransactionBuilder, Networks, Operation, Asset, Memo } = await import('@stellar/stellar-sdk')
    
    const server = new Horizon.Server('https://horizon-testnet.stellar.org')
    const account = await server.loadAccount(wallet.publicKey)

    setTxStatus(TX_STATUS.BUILDING)
    addEvent({ type: 'info', message: 'Loading account sequence number from Horizon...' })

    const txBuilder = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({
        destination,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)

    if (memo) {
      txBuilder.addMemo(Memo.text(memo.slice(0, 28)))
    }

    const tx = txBuilder.build()

    // Phase 2: Signing
    setTxStatus(TX_STATUS.SIGNING)
    addEvent({ type: 'info', message: 'Requesting signature from Freighter wallet...' })

    const freighter = await import('@stellar/freighter-api')
    const { signedXDR } = await freighter.signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
      network: 'TESTNET',
    })

    // Phase 3: Submitting
    setTxStatus(TX_STATUS.SUBMITTING)
    addEvent({ type: 'info', message: 'Broadcasting transaction to Stellar Testnet...' })

    const { TransactionBuilder: TB2 } = await import('@stellar/stellar-sdk')
    const signedTx = TB2.fromXDR(signedXDR, Networks.TESTNET)
    const result = await server.submitTransaction(signedTx)

    setTxHash(result.hash)
    setTxStatus(TX_STATUS.SUCCESS)
    addEvent({
      type: 'success',
      message: `Payment confirmed! ${amount} XLM sent successfully.`,
      hash: result.hash,
    })
  } catch (err) {
    // --- Error Guard 3: Transaction failed ---
    if (err?.response?.data?.extras?.result_codes) {
      const codes = err.response.data.extras.result_codes
      const message = `Transaction failed: ${JSON.stringify(codes)}`
      throw new Error(message)
    }
    if (err.message?.includes('reject') || err.message?.includes('cancel')) {
      const e = new Error(ERROR_MESSAGES[ERRORS.USER_REJECTED])
      e.type = ERRORS.USER_REJECTED
      throw e
    }
    throw err
  }
}

// Simulated transaction for Demo / xBull wallets
async function simulateTransaction({ wallet, destination, amount, memo, setTxStatus, setTxHash, addEvent, txHistory, setTxHistory }) {
  // Phase 2: Signing (simulated)
  setTxStatus(TX_STATUS.SIGNING)
  addEvent({ type: 'info', message: `${wallet.label}: Signing transaction envelope...` })
  await delay(800)

  // Simulate 5% random failure for realism
  if (Math.random() < 0.05) {
    throw new Error(ERROR_MESSAGES[ERRORS.TRANSACTION_FAILED])
  }

  // Phase 3: Submitting
  setTxStatus(TX_STATUS.SUBMITTING)
  addEvent({ type: 'info', message: 'Broadcasting to Stellar Testnet (simulated)...' })
  await delay(1200)

  const hash = generateMockHash()
  setTxHash(hash)
  setTxStatus(TX_STATUS.SUCCESS)

  const record = {
    id: Date.now(),
    hash,
    from: wallet.publicKey,
    to: destination,
    amount,
    memo: memo || '',
    timestamp: new Date().toISOString(),
    status: 'success',
    ledger: Math.floor(Math.random() * 1000000) + 4000000,
    fee: '0.0000100',
  }
  setTxHistory(prev => [record, ...prev].slice(0, 20))

  addEvent({
    type: 'success',
    message: `Payment confirmed! ${amount} XLM → ${destination.slice(0, 8)}...`,
    hash,
  })
}

function classifyError(err) {
  const msg = (err?.message || '').toLowerCase()
  if (msg.includes('balance') || msg.includes('underfunded')) return ERRORS.INSUFFICIENT_BALANCE
  if (msg.includes('reject') || msg.includes('cancel') || msg.includes('denied')) return ERRORS.USER_REJECTED
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return ERRORS.NETWORK_ERROR
  return ERRORS.TRANSACTION_FAILED
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
