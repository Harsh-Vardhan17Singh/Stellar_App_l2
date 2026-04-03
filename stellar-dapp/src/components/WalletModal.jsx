import React, { useState } from 'react'
import { X, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { WALLET_TYPES, WALLET_INFO } from '../hooks/useWallet'
import { shortenAddress } from '../utils/stellar'

export default function WalletModal({ isOpen, onClose, wallet, isConnecting, walletError, freighterAvailable, connectFreighter, connectDemo, connectXBull, disconnect }) {
  const [demoAccountIdx, setDemoAccountIdx] = useState(0)

  if (!isOpen) return null

  const handleConnect = async (type) => {
    if (type === WALLET_TYPES.FREIGHTER) await connectFreighter()
    else if (type === WALLET_TYPES.DEMO) await connectDemo(demoAccountIdx)
    else if (type === WALLET_TYPES.XBULL) await connectXBull()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div
        className="relative w-full max-w-md stellar-card p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-gradient-cyan">
            {wallet ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cosmos-border/50 transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Already connected */}
        {wallet && (
          <div className="mb-6 p-4 rounded-xl bg-cosmos-dark border border-cosmos-green/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{WALLET_INFO[wallet.type]?.icon}</span>
              <div>
                <div className="font-semibold text-white">{wallet.label}</div>
                <div className="text-xs text-cosmos-green flex items-center gap-1">
                  <CheckCircle size={12} />
                  Connected
                </div>
              </div>
            </div>
            <div className="font-mono text-xs text-gray-400 mb-1">Address</div>
            <div className="font-mono text-sm text-cosmos-accent break-all">{wallet.publicKey}</div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Balance</div>
                <div className="font-mono text-cosmos-gold font-semibold">
                  {parseFloat(wallet.balance).toFixed(4)} XLM
                </div>
              </div>
              <button
                onClick={() => { disconnect(); onClose() }}
                className="stellar-btn-secondary text-xs px-4 py-2"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {walletError && (
          <div className="mb-4 p-3 rounded-lg border border-cosmos-red/40 bg-cosmos-red/10 flex items-start gap-2">
            <AlertCircle size={16} className="text-cosmos-red mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{walletError}</p>
          </div>
        )}

        {/* Wallet options */}
        {!wallet && (
          <div className="space-y-3">
            {/* Freighter */}
            <WalletOption
              type={WALLET_TYPES.FREIGHTER}
              info={WALLET_INFO[WALLET_TYPES.FREIGHTER]}
              available={freighterAvailable}
              isConnecting={isConnecting}
              onConnect={() => handleConnect(WALLET_TYPES.FREIGHTER)}
              badge={freighterAvailable ? 'Detected' : 'Not installed'}
              badgeColor={freighterAvailable ? 'text-cosmos-green' : 'text-gray-500'}
            />

            {/* Demo Wallet */}
            <div className="p-4 rounded-xl border border-cosmos-border hover:border-cosmos-accent/50 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    {WALLET_INFO[WALLET_TYPES.DEMO].icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{WALLET_INFO[WALLET_TYPES.DEMO].name}</div>
                    <div className="text-xs text-gray-500">{WALLET_INFO[WALLET_TYPES.DEMO].description}</div>
                  </div>
                </div>
                <span className="text-xs text-cosmos-accent">Built-in</span>
              </div>
              <div className="flex gap-2 mb-3">
                {[0, 1].map(i => (
                  <button
                    key={i}
                    onClick={() => setDemoAccountIdx(i)}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-mono transition-all ${
                      demoAccountIdx === i
                        ? 'bg-cosmos-accent/20 border border-cosmos-accent text-cosmos-accent'
                        : 'border border-cosmos-border text-gray-400 hover:border-cosmos-accent/50'
                    }`}
                  >
                    Account #{i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleConnect(WALLET_TYPES.DEMO)}
                disabled={isConnecting}
                className="stellar-btn-primary w-full flex items-center justify-center gap-2"
              >
                {isConnecting ? <><Loader2 size={14} className="animate-spin" /> Connecting...</> : 'Connect Demo'}
              </button>
            </div>

            {/* xBull */}
            <WalletOption
              type={WALLET_TYPES.XBULL}
              info={WALLET_INFO[WALLET_TYPES.XBULL]}
              available={true}
              isConnecting={isConnecting}
              onConnect={() => handleConnect(WALLET_TYPES.XBULL)}
              badge="Simulated"
              badgeColor="text-yellow-500"
            />
          </div>
        )}

        <p className="mt-4 text-center text-xs text-gray-600">
          All transactions use <span className="text-cosmos-accent">Stellar Testnet</span> — no real XLM at risk
        </p>
      </div>
    </div>
  )
}

function WalletOption({ type, info, available, isConnecting, onConnect, badge, badgeColor }) {
  return (
    <div className="p-4 rounded-xl border border-cosmos-border hover:border-cosmos-accent/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: `${info.color}18`, border: `1px solid ${info.color}44` }}
          >
            {info.icon}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{info.name}</div>
            <div className="text-xs text-gray-500">{info.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${badgeColor}`}>{badge}</span>
          {info.downloadUrl && !available && (
            <a href={info.downloadUrl} target="_blank" rel="noopener noreferrer"
              className="text-gray-500 hover:text-cosmos-accent transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="stellar-btn-primary w-full flex items-center justify-center gap-2 text-xs py-2"
      >
        {isConnecting
          ? <><Loader2 size={13} className="animate-spin" /> Connecting...</>
          : `Connect ${info.name}`
        }
      </button>
    </div>
  )
}
