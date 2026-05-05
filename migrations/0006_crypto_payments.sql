-- Phase 9: Crypto payments (USDT TRC20 MVP)
-- Adds customer submission queue, admin verification audit trail,
-- and provider-agnostic payment extensions.

-- Optional wallet configuration store (future admin-manageable, no UI yet).
-- Runtime falls back to USDT_TRC20_WALLET_ADDRESS when no active row exists.
CREATE TABLE IF NOT EXISTS payment_wallet_settings (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  updatedBy TEXT,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_settings_network_active
  ON payment_wallet_settings(network, isActive);

-- Customer-submitted crypto payment proofs.
CREATE TABLE IF NOT EXISTS crypto_payment_submissions (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'TRC20',
  txHash TEXT NOT NULL,
  walletFrom TEXT,
  amountCrypto REAL,
  proofUrl TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | verified | rejected
  submittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TEXT,
  reviewedBy TEXT,
  rejectionReason TEXT,
  adminNotes TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Strong duplicate protection:
-- 1) Prevent reusing the same tx hash across network.
-- 2) Prevent duplicate tx hash submissions for the same order.
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_submission_txhash_network
  ON crypto_payment_submissions(txHash, network);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_submission_order_txhash
  ON crypto_payment_submissions(orderId, txHash);
CREATE INDEX IF NOT EXISTS idx_crypto_submission_order
  ON crypto_payment_submissions(orderId);
CREATE INDEX IF NOT EXISTS idx_crypto_submission_status
  ON crypto_payment_submissions(status);

-- Admin verification/rejection audit trail.
CREATE TABLE IF NOT EXISTS crypto_verification_logs (
  id TEXT PRIMARY KEY,
  submissionId TEXT NOT NULL,
  action TEXT NOT NULL,
  -- action: verified | rejected
  adminId TEXT NOT NULL,
  note TEXT,
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submissionId) REFERENCES crypto_payment_submissions(id)
);

CREATE INDEX IF NOT EXISTS idx_crypto_verification_submission
  ON crypto_verification_logs(submissionId);
CREATE INDEX IF NOT EXISTS idx_crypto_verification_action
  ON crypto_verification_logs(action);

-- Extend provider-agnostic payments ledger with crypto-specific metadata.
ALTER TABLE payments ADD COLUMN cryptoTxHash TEXT;
ALTER TABLE payments ADD COLUMN cryptoNetwork TEXT;
ALTER TABLE payments ADD COLUMN cryptoWalletFrom TEXT;
ALTER TABLE payments ADD COLUMN cryptoProofUrl TEXT;
