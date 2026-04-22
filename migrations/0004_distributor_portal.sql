-- Phase 3: Distributor portal
-- Extend distributor_submissions with approval workflow and tier tracking

ALTER TABLE distributor_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
-- status: pending | reviewed | approved | rejected

ALTER TABLE distributor_submissions ADD COLUMN discountTier TEXT NOT NULL DEFAULT 'bronze';
-- bronze = 10%, silver = 15%, gold = 20%, platinum = 25%

ALTER TABLE distributor_submissions ADD COLUMN approvedAt TEXT;
ALTER TABLE distributor_submissions ADD COLUMN approvedBy TEXT;
ALTER TABLE distributor_submissions ADD COLUMN rejectedAt TEXT;
ALTER TABLE distributor_submissions ADD COLUMN rejectionReason TEXT;
ALTER TABLE distributor_submissions ADD COLUMN internalNotes TEXT;

-- Distributor order quotes (submitted via distributor portal)
CREATE TABLE IF NOT EXISTS distributor_quotes (
  id TEXT PRIMARY KEY,
  referenceId TEXT UNIQUE NOT NULL,
  distributorEmail TEXT NOT NULL,
  distributorCompany TEXT NOT NULL,
  discountTier TEXT NOT NULL DEFAULT 'bronze',
  currency TEXT NOT NULL DEFAULT 'USD',
  endCustomerName TEXT,
  endCustomerCompany TEXT,
  endCustomerCountry TEXT,
  products TEXT NOT NULL DEFAULT '[]',
  -- JSON: [{productSlug, productName, qty, unitPriceList, unitPriceNet, lineTotal}]
  subtotalList REAL NOT NULL DEFAULT 0,
  subtotalNet REAL NOT NULL DEFAULT 0,
  shippingRegion TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | reviewed | quoted | approved | rejected | ordered
  respondedAt TEXT,
  adminNotes TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dist_quotes_email ON distributor_quotes(distributorEmail);
CREATE INDEX IF NOT EXISTS idx_dist_quotes_status ON distributor_quotes(status);
CREATE INDEX IF NOT EXISTS idx_dist_quotes_createdAt ON distributor_quotes(createdAt DESC);
