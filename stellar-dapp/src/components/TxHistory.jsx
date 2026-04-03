import React, { useState } from 'react'
import { History, ExternalLink, Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { shortenAddress, formatTime, openInExplorer, copyToClipboard } from '../utils/stellar'

export default function TxHistory({ txHistory }) {
  const [expanded, setExpanded] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = async (hash, id) => {
    await copyToClipboard(hash)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (txHistory.length === 0) return null

  const visible = expanded ? txHistory : txHistory.slice(0, 3)

  return (
    <div className="stellar-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-gray-400" />
        <h3 className="font-display font-bold text-sm text-white">Transaction History</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-cosmos-border text-gray-400 text-xs font-mono">
          {txHistory.length}
        </span>
      </div>

      <div className="space-y-2">
        {visible.map(tx => (
          <div key={tx.id} className="p-3 rounded-lg bg-cosmos-dark border border-cosmos-border/60 hover:border-cosmos-border transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-cosmos-green"
                  style={{ boxShadow: '0 0 6px #00ff88' }}
                />
                <span className="text-xs font-mono text-cosmos-green font-semibold">SUCCESS</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{formatTime(tx.timestamp)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">To</div>
                <div className="font-mono text-xs text-gray-300">{shortenAddress(tx.to)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5">Amount</div>
                <div className="font-mono text-sm text-cosmos-gold font-semibold">
                  {parseFloat(tx.amount).toFixed(4)} XLM
                </div>
              </div>
            </div>

            {tx.memo && (
              <div className="mt-1.5 text-xs text-gray-500">
                Memo: <span className="text-gray-400">{tx.memo}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-cosmos-border/50">
              <code className="text-xs text-cosmos-accent truncate flex-1">{shortenAddress(tx.hash, 8)}</code>
              <button
                onClick={() => handleCopy(tx.hash, tx.id)}
                className="text-gray-500 hover:text-cosmos-accent transition-colors"
              >
                {copiedId === tx.id ? <CheckCircle2 size={12} className="text-cosmos-green" /> : <Copy size={12} />}
              </button>
              <button
                onClick={() => openInExplorer(tx.hash)}
                className="text-gray-500 hover:text-cosmos-accent transition-colors"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {txHistory.length > 3 && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-cosmos-accent transition-colors py-2"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Show less</>
          ) : (
            <><ChevronDown size={14} /> Show {txHistory.length - 3} more</>
          )}
        </button>
      )}
    </div>
  )
}
