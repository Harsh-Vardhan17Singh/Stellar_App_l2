import React, { useState } from 'react'
import { FileCode, Copy, CheckCircle2, ExternalLink } from 'lucide-react'
import { CONTRACT_ID, SAMPLE_TX_HASH, copyToClipboard, shortenAddress } from '../utils/stellar'

export default function ContractInfo() {
  const [copiedKey, setCopiedKey] = useState(null)

  const handleCopy = async (text, key) => {
    await copyToClipboard(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const items = [
    {
      key: 'contract',
      label: 'Contract Address',
      value: CONTRACT_ID,
      short: shortenAddress(CONTRACT_ID, 10),
      link: `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`,
      description: 'Payment Tracker contract deployed on Testnet',
    },
    {
      key: 'sample',
      label: 'Sample Tx Hash',
      value: SAMPLE_TX_HASH,
      short: shortenAddress(SAMPLE_TX_HASH, 10),
      link: `https://stellar.expert/explorer/testnet/tx/${SAMPLE_TX_HASH}`,
      description: 'Example successful transaction on Testnet',
    },
  ]

  return (
    <div className="stellar-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCode size={16} className="text-cosmos-purple" />
        <h3 className="font-display font-bold text-sm text-white">Contract Info</h3>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="p-3 rounded-lg bg-cosmos-dark border border-cosmos-border/60">
            <div className="text-xs text-gray-500 mb-1">{item.label}</div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-cosmos-accent font-mono truncate flex-1">{item.short}</code>
              <button
                onClick={() => handleCopy(item.value, item.key)}
                className="text-gray-500 hover:text-cosmos-accent transition-colors shrink-0"
              >
                {copiedKey === item.key
                  ? <CheckCircle2 size={13} className="text-cosmos-green" />
                  : <Copy size={13} />
                }
              </button>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cosmos-accent transition-colors shrink-0"
              >
                <ExternalLink size={13} />
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
          </div>
        ))}

        <div className="p-3 rounded-lg bg-cosmos-dark border border-cosmos-border/60">
          <div className="text-xs text-gray-500 mb-2">Contract Features</div>
          <ul className="space-y-1">
            {[
              'Payment tracking & history',
              'Multi-currency support (XLM)',
              'Memo-tagged transactions',
              'Real-time event emission',
            ].map(feat => (
              <li key={feat} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-cosmos-green">▹</span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="https://developers.stellar.org/docs/smart-contracts"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-cosmos-accent transition-colors py-2 border border-cosmos-border/50 rounded-lg hover:border-cosmos-accent/30"
        >
          <ExternalLink size={12} />
          Stellar Soroban Docs
        </a>
      </div>
    </div>
  )
}
