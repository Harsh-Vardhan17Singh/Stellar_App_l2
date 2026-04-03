import React, { useState } from 'react'
import { Send, AlertCircle, CheckCircle2, Loader2, X, ExternalLink, Copy } from 'lucide-react'
import { TX_STATUS } from '../hooks/useTransaction'
import { isValidStellarAddress, shortenAddress, openInExplorer, copyToClipboard, ERRORS } from '../utils/stellar'

const ERROR_COLORS = {
  [ERRORS.WALLET_NOT_CONNECTED]: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  [ERRORS.INSUFFICIENT_BALANCE]: 'border-cosmos-red/50 bg-cosmos-red/10 text-red-300',
  [ERRORS.TRANSACTION_FAILED]: 'border-cosmos-red/50 bg-cosmos-red/10 text-red-300',
  [ERRORS.NETWORK_ERROR]: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
  [ERRORS.USER_REJECTED]: 'border-gray-500/50 bg-gray-500/10 text-gray-300',
}

const STATUS_STEPS = [
  { key: TX_STATUS.BUILDING, label: 'Building', icon: '⚙️' },
  { key: TX_STATUS.SIGNING, label: 'Signing', icon: '✍️' },
  { key: TX_STATUS.SUBMITTING, label: 'Submitting', icon: '📡' },
  { key: TX_STATUS.SUCCESS, label: 'Confirmed', icon: '✅' },
]

export default function PaymentForm({ wallet, txStatus, txHash, txError, sendPayment, cancelTx, resetTx }) {
  const [form, setForm] = useState({
    destination: '',
    amount: '',
    memo: '',
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [copied, setCopied] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.destination) {
      errs.destination = 'Destination address is required'
    } else if (!isValidStellarAddress(form.destination)) {
      errs.destination = 'Invalid Stellar address (must start with G, 56 chars)'
    }
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      errs.amount = 'Enter a valid amount greater than 0'
    }
    if (form.memo && form.memo.length > 28) {
      errs.memo = 'Memo must be 28 characters or less'
    }
    setValidationErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    sendPayment({
      destination: form.destination,
      amount: form.amount,
      memo: form.memo,
    })
  }

  const handleCopyHash = async () => {
    if (!txHash) return
    const ok = await copyToClipboard(txHash)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isProcessing = [TX_STATUS.BUILDING, TX_STATUS.SIGNING, TX_STATUS.SUBMITTING].includes(txStatus)
  const isSuccess = txStatus === TX_STATUS.SUCCESS
  const isFailed = txStatus === TX_STATUS.FAILED

  // Active step index
  const activeStepIdx = STATUS_STEPS.findIndex(s => s.key === txStatus)

  return (
    <div className="stellar-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cosmos-accent/10 border border-cosmos-accent/30 flex items-center justify-center">
          <Send size={18} className="text-cosmos-accent" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white">Send Payment</h2>
          <p className="text-xs text-gray-500">Stellar Testnet · XLM transfer</p>
        </div>
      </div>

      {/* Transaction status overlay */}
      {isProcessing && (
        <div className="mb-6 p-4 rounded-xl border border-cosmos-accent/30 bg-cosmos-accent/5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={16} className="text-cosmos-accent animate-spin" />
            <span className="text-sm font-semibold text-cosmos-accent">Processing Transaction</span>
          </div>
          <div className="flex items-center gap-1">
            {STATUS_STEPS.slice(0, 3).map((step, i) => (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center gap-1 ${
                  i <= activeStepIdx ? 'opacity-100' : 'opacity-30'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                    i < activeStepIdx
                      ? 'bg-cosmos-green/20 border-cosmos-green text-cosmos-green'
                      : i === activeStepIdx
                      ? 'bg-cosmos-accent/20 border-cosmos-accent animate-pulse'
                      : 'border-cosmos-border'
                  }`}>
                    {i < activeStepIdx ? '✓' : step.icon}
                  </div>
                  <span className="text-xs text-gray-400">{step.label}</span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-px mb-4 ${i < activeStepIdx ? 'bg-cosmos-green' : 'bg-cosmos-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Success state */}
      {isSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-cosmos-green/40 bg-cosmos-green/8 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-cosmos-green" />
            <span className="font-semibold text-cosmos-green">Transaction Confirmed!</span>
          </div>
          {txHash && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Transaction Hash</div>
              <div className="flex items-center gap-2">
                <code className="hash-display flex-1 truncate">{txHash}</code>
                <button onClick={handleCopyHash} className="text-gray-400 hover:text-cosmos-accent transition-colors" title="Copy hash">
                  {copied ? <CheckCircle2 size={14} className="text-cosmos-green" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => openInExplorer(txHash)}
                  className="text-gray-400 hover:text-cosmos-accent transition-colors"
                  title="View on Stellar Expert"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => { resetTx(); setForm({ destination: '', amount: '', memo: '' }) }}
            className="mt-3 stellar-btn-secondary w-full text-xs py-2"
          >
            Send Another Payment
          </button>
        </div>
      )}

      {/* Error states — 3 distinct error types */}
      {(txError || isFailed) && (
        <div className={`mb-6 p-4 rounded-xl border animate-fade-in ${
          txError?.type ? (ERROR_COLORS[txError.type] || 'border-cosmos-red/50 bg-cosmos-red/10 text-red-300') : 'border-cosmos-red/50 bg-cosmos-red/10 text-red-300'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                {txError?.type === ERRORS.WALLET_NOT_CONNECTED && '⚠️ Wallet Not Connected'}
                {txError?.type === ERRORS.INSUFFICIENT_BALANCE && '💸 Insufficient Balance'}
                {(txError?.type === ERRORS.TRANSACTION_FAILED || isFailed) && '❌ Transaction Failed'}
                {txError?.type === ERRORS.NETWORK_ERROR && '🌐 Network Error'}
                {txError?.type === ERRORS.USER_REJECTED && '🚫 Rejected'}
              </div>
              <p className="text-sm opacity-90">{txError?.message || 'Transaction failed. Please try again.'}</p>
            </div>
            <button onClick={resetTx} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Destination Address
            </label>
            <input
              type="text"
              className={`input-field ${validationErrors.destination ? 'border-cosmos-red' : ''}`}
              placeholder="G... (Stellar Testnet address)"
              value={form.destination}
              onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
              disabled={isProcessing}
              spellCheck={false}
            />
            {validationErrors.destination && (
              <p className="mt-1 text-xs text-cosmos-red">{validationErrors.destination}</p>
            )}
            {/* Quick-fill test address */}
            <button
              type="button"
              className="mt-1 text-xs text-gray-500 hover:text-cosmos-accent transition-colors"
              onClick={() => setForm(p => ({ ...p, destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37' }))}
            >
              ↩ Use test address
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Amount (XLM)
            </label>
            <div className="relative">
              <input
                type="number"
                className={`input-field pr-16 ${validationErrors.amount ? 'border-cosmos-red' : ''}`}
                placeholder="0.0000000"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                disabled={isProcessing}
                step="0.0000001"
                min="0.0000001"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-gray-500">XLM</span>
            </div>
            {validationErrors.amount && (
              <p className="mt-1 text-xs text-cosmos-red">{validationErrors.amount}</p>
            )}
            {wallet && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Available: <span className="text-cosmos-gold font-mono">{parseFloat(wallet.balance || 0).toFixed(4)} XLM</span>
                </span>
                <button
                  type="button"
                  className="text-xs text-cosmos-accent hover:underline"
                  onClick={() => {
                    const max = Math.max(0, parseFloat(wallet.balance || 0) - 1.5)
                    setForm(p => ({ ...p, amount: max.toFixed(7) }))
                  }}
                >
                  Max
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Memo <span className="text-gray-600 normal-case">(optional, max 28 chars)</span>
            </label>
            <input
              type="text"
              className={`input-field ${validationErrors.memo ? 'border-cosmos-red' : ''}`}
              placeholder="Payment reference..."
              value={form.memo}
              onChange={e => setForm(p => ({ ...p, memo: e.target.value }))}
              disabled={isProcessing}
              maxLength={28}
            />
            <div className="flex justify-between">
              {validationErrors.memo
                ? <p className="mt-1 text-xs text-cosmos-red">{validationErrors.memo}</p>
                : <span />
              }
              <span className="mt-1 text-xs text-gray-600 text-right">{form.memo.length}/28</span>
            </div>
          </div>

          <div className="pt-2">
            {isProcessing ? (
              <button type="button" onClick={cancelTx} className="stellar-btn-secondary w-full flex items-center justify-center gap-2">
                <X size={16} />
                Cancel Transaction
              </button>
            ) : (
              <button
                type="submit"
                className="stellar-btn-primary w-full flex items-center justify-center gap-2"
                disabled={isProcessing}
              >
                <Send size={16} />
                Send Payment
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
