-- Phase 8: Admin-editable product settings overlay
-- Product CONTENT (descriptions, specs, images) stays in lib/data.ts (type-safe, fast).
-- This table stores only the fields admins need to change without a code deploy:
-- pricing, availability, lead time, visibility.

CREATE TABLE IF NOT EXISTS product_settings (
  slug          TEXT PRIMARY KEY,
  unitPriceUSD  REAL    NOT NULL,
  unitPriceAUD  REAL,                           -- NULL = derive from AUD_RATE × unitPriceUSD
  unit          TEXT    NOT NULL DEFAULT 'kg',
  minQty        REAL    NOT NULL DEFAULT 50,
  leadTimeDays  INTEGER NOT NULL DEFAULT 7,
  isActive      INTEGER NOT NULL DEFAULT 1,     -- 1 = live, 0 = hidden from public
  featured      INTEGER NOT NULL DEFAULT 0,     -- 1 = shown in featured sections
  sortOrder     INTEGER NOT NULL DEFAULT 0,
  adminNotes    TEXT,
  updatedAt     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_settings_active   ON product_settings(isActive);
CREATE INDEX IF NOT EXISTS idx_product_settings_featured ON product_settings(featured);
