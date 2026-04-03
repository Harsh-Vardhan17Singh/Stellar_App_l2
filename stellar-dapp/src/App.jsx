import React, { useState } from 'react'
import Header from './components/Header'
import WalletModal from './components/WalletModal'
import PaymentForm from './components/PaymentForm'
import EventFeed from './components/EventFeed'
import TxHistory from './components/TxHistory'
import ContractInfo from './components/ContractInfo'
import Starfield from './components/Starfield'
import { useWallet } from './hooks/useWallet'
import { useTransaction } from './hooks/useTransaction'
import { useEventFeed } from './hooks/useEventFeed'

export default function App() {
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  const {
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
  } = useWallet()

  const { events, addEvent, clearEvents } = useEventFeed(wallet)

  const {
    txStatus,
    txHash,
    txError,
    txHistory,
    sendPayment,
    cancelTx,
    resetTx,
  } = useTransaction(wallet, addEvent)

  return (
    <div className="min-h-screen bg-cosmos-dark relative">
      {/* Background layers */}
      <Starfield />
      <div className="scan-overlay" />
      <div
        className="fixed inset-0 bg-cosmos-grid pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      {/* App content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          wallet={wallet}
          isConnecting={isConnecting}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          onRefreshBalance={refreshBalance}
        />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          {/* Hero banner — shown when no wallet */}
          {!wallet && (
            <div className="mb-8 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cosmos-accent/30 bg-cosmos-accent/8 text-cosmos-accent text-sm font-mono mb-4">
                <span
                  className="w-2 h-2 rounded-full bg-cosmos-green animate-pulse"
                  style={{ boxShadow: '0 0 6px #00ff88' }}
                />
                Stellar Testnet · Payment Tracker dApp
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-3 tracking-wider">
                STELLAR<span className="text-gradient-cyan">VAULT</span>
              </h1>
              <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                A multi-wallet Stellar dApp for tracking payments on Testnet.
                Connect Freighter, Demo, or xBull wallet to get started.
              </p>
              <button
                onClick={() => setWalletModalOpen(true)}
                className="stellar-btn-primary mt-6 text-sm px-8 py-3"
              >
                Connect Wallet →
              </button>
            </div>
          )}

          {/* Main grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Payment form + history */}
            <div className="lg:col-span-2 space-y-6">
              <PaymentForm
                wallet={wallet}
                txStatus={txStatus}
                txHash={txHash}
                txError={txError}
                sendPayment={sendPayment}
                cancelTx={cancelTx}
                resetTx={resetTx}
              />
              <TxHistory txHistory={txHistory} />
            </div>

            {/* Right column: Events + contract info */}
            <div className="space-y-6 flex flex-col">
              <div className="flex-1 min-h-0" style={{ minHeight: '380px' }}>
                <EventFeed events={events} clearEvents={clearEvents} />
              </div>
              <ContractInfo />
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Network', value: 'Testnet', color: 'text-cosmos-green' },
              { label: 'Wallets Supported', value: '3', color: 'text-cosmos-accent' },
              { label: 'Transactions', value: txHistory.length.toString(), color: 'text-cosmos-gold' },
              { label: 'Events', value: events.length.toString(), color: 'text-cosmos-purple' },
            ].map(stat => (
              <div
                key={stat.label}
                className="stellar-card px-4 py-3 flex flex-col items-center text-center"
              >
                <div className={`font-display font-bold text-xl ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </main>

        <footer className="relative z-10 border-t border-cosmos-border/30 py-4 text-center">
          <p className="text-xs text-gray-600 font-mono">
            StellarVault · Stellar Testnet dApp · Built with React + Vite + Tailwind
            <span className="mx-2 text-cosmos-border">·</span>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cosmos-accent hover:underline"
            >
              stellar.org
            </a>
          </p>
        </footer>
      </div>

      {/* Wallet modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => { setWalletModalOpen(false); setWalletError(null) }}
        wallet={wallet}
        isConnecting={isConnecting}
        walletError={walletError}
        freighterAvailable={freighterAvailable}
        connectFreighter={connectFreighter}
        connectDemo={connectDemo}
        connectXBull={connectXBull}
        disconnect={disconnect}
      />
    </div>
  )
}
