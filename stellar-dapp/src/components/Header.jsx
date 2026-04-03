import React from 'react'
import { Zap, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react'
import { WALLET_INFO } from '../hooks/useWallet'
import { shortenAddress } from '../utils/stellar'

export default function Header({ wallet, isConnecting, onOpenWalletModal, onRefreshBalance }) {
  return (
    <header className="relative z-10 border-b border-cosmos-border/50 bg-cosmos-dark/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(14,165,233,0.1))',
              border: '1px solid rgba(0,212,255,0.4)',
              boxShadow: '0 0 20px rgba(0,212,255,0.15)',
            }}
          >
            <Zap size={18} className="text-cosmos-accent" />
          </div>
          <div>
            <span className="font-display font-bold text-white tracking-wider">StellarVault</span>
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-cosmos-accent/15 text-cosmos-accent border border-cosmos-accent/30 font-mono">
              TESTNET
            </span>
          </div>
        </div>

        {/* Network indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cosmos-border bg-cosmos-card">
          <span
            className="w-2 h-2 rounded-full bg-cosmos-green"
            style={{ boxShadow: '0 0 6px #00ff88' }}
          />
          <span className="text-xs font-mono text-gray-400">Stellar Testnet</span>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-cosmos-accent transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Wallet button */}
        {wallet ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshBalance}
              className="p-2 text-gray-500 hover:text-cosmos-accent transition-colors rounded-lg hover:bg-cosmos-card"
              title="Refresh balance"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onOpenWalletModal}
              className="wallet-badge hover:border-cosmos-accent/60 hover:text-white transition-all group"
            >
              <span>{WALLET_INFO[wallet.type]?.icon || '👛'}</span>
              <span className="text-gray-300">{shortenAddress(wallet.publicKey)}</span>
              <span className="text-cosmos-gold font-semibold">
                {parseFloat(wallet.balance || 0).toFixed(2)} XLM
              </span>
              <ChevronDown size={12} className="text-gray-500 group-hover:text-cosmos-accent transition-colors" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenWalletModal}
            disabled={isConnecting}
            className="stellar-btn-primary text-xs px-5 py-2.5"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  )
}
