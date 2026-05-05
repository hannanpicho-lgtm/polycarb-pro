-- Phase 10: Add label column to payment_wallet_settings
-- Friendly display name for a wallet entry, distinct from admin notes.
ALTER TABLE payment_wallet_settings ADD COLUMN label TEXT;
