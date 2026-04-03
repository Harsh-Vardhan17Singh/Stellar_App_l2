# PaymentTracker — Soroban Smart Contract

A Stellar Soroban smart contract that tracks XLM payments on-chain with full event emission, admin controls, and query capabilities.

## Contract Functions

### Public

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `initialize` | `admin: Address` | — | One-time setup, sets admin |
| `send_payment` | `sender, recipient: Address`, `amount: i128`, `memo: String` | `u64` (payment ID) | Record a payment on-chain |
| `get_payment` | `id: u64` | `PaymentRecord` | Fetch a single payment by ID |
| `get_payments_by_sender` | `sender: Address`, `limit: u32` | `Vec<PaymentSummary>` | List payments sent by address |
| `get_payments_by_recipient` | `recipient: Address`, `limit: u32` | `Vec<PaymentSummary>` | List payments received by address |
| `get_payment_count` | — | `u64` | Total number of tracked payments |
| `is_paused` | — | `bool` | Whether contract is paused |
| `get_admin` | — | `Address` | Current admin address |

### Admin Only

| Function | Parameters | Description |
|----------|-----------|-------------|
| `pause` | — | Pause all new payments |
| `resume` | — | Resume payments |
| `refund_payment` | `id: u64` | Mark payment as refunded |
| `transfer_admin` | `new_admin: Address` | Transfer admin role |

## Data Types

```rust
pub struct PaymentRecord {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,          // stroops (1 XLM = 10_000_000)
    pub memo: String,          // max 28 chars
    pub timestamp: u64,        // ledger Unix timestamp
    pub status: PaymentStatus, // Pending | Completed | Refunded
}

pub enum PaymentStatus {
    Pending,
    Completed,
    Refunded,
}
```

## Events Emitted

| Event Topic | Data | When |
|-------------|------|------|
| `PAY_SENT` | `(id, recipient, amount, timestamp)` | Payment recorded |
| `PAY_RFND` | `(id, recipient, amount)` | Payment refunded |
| `PAUSED` | — | Contract paused |
| `RESUMED` | — | Contract resumed |
| `ADM_CHG` | `new_admin` | Admin transferred |

## Validations / Guards

- `amount > 0` — positive amounts only
- `sender != recipient` — no self-payments
- `memo.len() <= 28` — matches Stellar protocol memo limit
- `!paused` — payments blocked while paused
- `admin.require_auth()` — admin ops need authorization

## Build & Deploy

```bash
# Install Rust + wasm target
rustup target add wasm32-unknown-unknown

# Build
cargo build --target wasm32-unknown-unknown --release

# Deploy to Testnet (uses Stellar CLI)
cd contracts
chmod +x deploy.sh
DEPLOYER_SECRET=S... ./deploy.sh
```

## Run Tests

```bash
cd contracts/payment-tracker
cargo test
```

## Deployed Instance

| Field | Value |
|-------|-------|
| Contract ID | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Network | Stellar Testnet |
| Explorer | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
