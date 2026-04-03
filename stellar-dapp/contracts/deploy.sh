#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build and deploy the PaymentTracker contract to Stellar Testnet
# =============================================================================
# Prerequisites:
#   - Rust + wasm32-unknown-unknown target
#   - Stellar CLI: https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli
#   - A funded Testnet account (pass via DEPLOYER_SECRET env var)
#
# Usage:
#   cd contracts
#   chmod +x deploy.sh
#   DEPLOYER_SECRET=S... ./deploy.sh
# =============================================================================

set -euo pipefail

NETWORK="testnet"
NETWORK_RPC="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  StellarVault — Contract Deployer"
echo "  Network: Stellar Testnet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v stellar &>/dev/null; then
  echo "ERROR: Stellar CLI not found."
  echo "Install: https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli"
  exit 1
fi
echo "Stellar CLI: $(stellar --version)"

echo "Configuring testnet network..."
stellar network add \
  --rpc-url "$NETWORK_RPC" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  "$NETWORK" 2>/dev/null || true

if [[ -z "${DEPLOYER_SECRET:-}" ]]; then
  echo "DEPLOYER_SECRET not set — generating fresh keypair..."
  stellar keys generate deployer --network testnet --fund
  DEPLOYER_ADDRESS=$(stellar keys address deployer)
  echo "New deployer: $DEPLOYER_ADDRESS"
else
  echo "$DEPLOYER_SECRET" | stellar keys add deployer --secret-key
  DEPLOYER_ADDRESS=$(stellar keys address deployer)
  echo "Deployer: $DEPLOYER_ADDRESS"
fi

echo "Funding via Friendbot..."
curl -sf "https://friendbot.stellar.org?addr=$DEPLOYER_ADDRESS" > /dev/null || true

echo "Installing wasm32 target..."
rustup target add wasm32-unknown-unknown

echo "Building contract..."
cargo build \
  --manifest-path payment-tracker/Cargo.toml \
  --target wasm32-unknown-unknown \
  --release

WASM="payment-tracker/target/wasm32-unknown-unknown/release/payment_tracker.wasm"
echo "Built: $WASM"

echo "Uploading wasm..."
WASM_HASH=$(stellar contract install \
  --wasm "$WASM" \
  --source deployer \
  --network "$NETWORK")
echo "Wasm hash: $WASM_HASH"

echo "Deploying contract..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm-hash "$WASM_HASH" \
  --source deployer \
  --network "$NETWORK")
echo "Contract ID: $CONTRACT_ID"

echo "Initializing..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source deployer \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_ADDRESS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DEPLOYMENT COMPLETE"
echo " Contract ID : $CONTRACT_ID"
echo " Wasm Hash   : $WASM_HASH"
echo " Admin       : $DEPLOYER_ADDRESS"
echo " Explorer    : https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo " Update src/utils/stellar.js:"
echo " export const CONTRACT_ID = '$CONTRACT_ID'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
