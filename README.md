# 🌟 StellarVault — Stellar Testnet Payment Tracker dApp

A production-grade Stellar dApp built with **React + Vite + Tailwind CSS** that supports multi-wallet connections and tracks payments on the Stellar Testnet via a deployed smart contract.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (check: `node -v`)
- **npm** v9+ or **pnpm** / **yarn**
- (Optional) [Freighter Wallet](https://www.freighter.app/) browser extension for real transaction signing

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 💼 Wallet Support

The dApp supports **3 wallets** out of the box:

| Wallet | Type | Notes |
|--------|------|-------|
| **Freighter** | Real browser extension | Install from [freighter.app](https://www.freighter.app/). Signs real Testnet transactions. |
| **Demo Wallet** | Built-in simulated wallet | Two pre-seeded Testnet accounts. No extension required. |
| **xBull Wallet** | Simulated | Simulates the xBull wallet interface for testing. |

> All wallets operate on **Stellar Testnet only** — no real XLM is ever at risk.

---

## 📜 Deployed Contract

| Field | Value |
|-------|-------|
| **Contract ID** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Network** | Stellar Testnet |
| **Type** | Payment Tracker (Soroban) |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |

### Sample Transaction Hash

```
a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```

[View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2)

---

## ✨ Features

### Core dApp Features
- **Multi-wallet support** — Freighter (real), Demo Wallet, xBull (simulated)
- **Payment tracker** — Send XLM payments with destination, amount, and memo
- **Transaction status** — Real-time 3-step status (Building → Signing → Submitting → Confirmed)
- **Transaction hash** — Displayed on success with copy & explorer link buttons
- **Transaction history** — Last 20 transactions stored in session

### Error Handling (3+ types)
1. `WALLET_NOT_CONNECTED` — Triggered when sending without a connected wallet
2. `INSUFFICIENT_BALANCE` — Triggered when balance < amount + 1.5 XLM base reserve
3. `TRANSACTION_FAILED` — Triggered on Horizon API rejection or network failure
4. `USER_REJECTED` — Triggered when user cancels Freighter signing prompt
5. `NETWORK_ERROR` — Triggered on fetch/timeout issues

### Real-Time Events
- **Live Event Feed** panel with timestamped events (INFO / SUCCESS / ERROR / WARN)
- **Horizon polling** — Polls Testnet every 10 seconds for new payments to/from connected wallet
- Incoming/outgoing payment detection with amounts and truncated addresses

### UI / UX
- Space / cosmos dark theme with animated starfield background
- Orbitron display font + Exo 2 body + JetBrains Mono for code
- Responsive layout (mobile → desktop)
- Copy-to-clipboard for addresses and hashes
- One-click "View on Stellar Expert" for all transaction hashes

---

## 🏗️ Project Structure

```
stellar-dapp/
├── public/
│   └── stellar-icon.svg          # App favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx             # Top navigation + wallet status
│   │   ├── WalletModal.jsx        # Wallet connection modal
│   │   ├── PaymentForm.jsx        # Send payment form + status UI
│   │   ├── EventFeed.jsx          # Real-time event log panel
│   │   ├── TxHistory.jsx          # Session transaction history
│   │   ├── ContractInfo.jsx       # Contract address + metadata
│   │   └── Starfield.jsx          # Animated background stars
│   ├── hooks/
│   │   ├── useWallet.js           # Multi-wallet connection logic
│   │   ├── useTransaction.js      # Tx building, signing, submission
│   │   └── useEventFeed.js        # Event log + Horizon polling
│   ├── utils/
│   │   └── stellar.js             # Constants, formatters, helpers
│   ├── App.jsx                    # Root component + layout
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind + custom CSS
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔧 Using Freighter (Real Transactions)

1. Install the [Freighter extension](https://www.freighter.app/)
2. Create or import a wallet
3. Switch Freighter to **Testnet** network
4. Fund your account using [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_ADDRESS)
5. Click "Connect Wallet" → "Connect Freighter" in the dApp
6. Send a real Testnet transaction!

---

## 🧪 Using Demo Wallet (No Extension Needed)

1. Click "Connect Wallet"
2. Select "Demo Wallet" → pick Account #1 or #2
3. Click "Connect Demo"
4. Use the test address button in the payment form to auto-fill a destination
5. Enter any amount under your available balance
6. Click "Send Payment" — transaction is simulated with realistic delays

---

## 🌐 Testnet Resources

| Resource | URL |
|----------|-----|
| Stellar Expert (Testnet) | https://stellar.expert/explorer/testnet |
| Horizon Testnet API | https://horizon-testnet.stellar.org |
| Friendbot (fund accounts) | https://friendbot.stellar.org |
| Stellar Lab | https://lab.stellar.org |
| Soroban Docs | https://developers.stellar.org/docs/smart-contracts |

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| @stellar/stellar-sdk | 12.x | Stellar transaction building |
| @stellar/freighter-api | 1.7 | Freighter wallet integration |
| lucide-react | 0.383 | Icon library |

---

## 📝 Git History (Meaningful Commits)

This project was developed with the following commit milestones:

```
commit 1: feat: initialize React+Vite project with Tailwind, multi-wallet hook (Freighter/Demo/xBull), and Stellar utility helpers

commit 2: feat: add PaymentForm with 3-step tx flow, 5 error types (wallet/balance/failed/rejected/network), EventFeed with Horizon polling, TxHistory panel, and ContractInfo sidebar
```

---

## 📄 License

MIT — free to use, fork, and build upon.

---

## 🦀 Smart Contract (Soroban / Rust)

The contract source lives in `contracts/payment-tracker/src/lib.rs`.

### Contract file layout

```
contracts/
├── Cargo.toml                        # Workspace manifest
├── README.md                         # Contract-specific docs
├── deploy.sh                         # One-command deploy script
└── payment-tracker/
    ├── Cargo.toml                    # Crate manifest
    └── src/
        └── lib.rs                    # Full contract source + unit tests
```

### Build & run tests locally

```bash
# Requires Rust + wasm32 target
rustup target add wasm32-unknown-unknown

cd contracts/payment-tracker
cargo test                           # Run all unit tests
cargo build --target wasm32-unknown-unknown --release  # Build wasm
```

### Deploy to Testnet

```bash
cd contracts
chmod +x deploy.sh
DEPLOYER_SECRET=SXXXXXXX... ./deploy.sh

```

### Result of this App
<img width="1757" height="892" alt="image" src="https://github.com/user-attachments/assets/bf8b5b7e-a4cf-4214-b129-5ca6621163b6" />


See `contracts/README.md` for full contract API reference.
