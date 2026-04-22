-- Phase 1: Commerce schema
-- Customers, Quotes, Orders, Order Items

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  phone TEXT,
  region TEXT NOT NULL DEFAULT 'international',
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  referenceId TEXT UNIQUE NOT NULL,
  customerId TEXT,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerCompany TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | reviewed | quoted | accepted | rejected | converted
  products TEXT NOT NULL DEFAULT '[]',
  -- JSON array of {productSlug, productName, qty, unitPrice, notes}
  message TEXT,
  adminNotes TEXT,
  quotedAmount REAL,
  respondedAt TEXT,
  expiresAt TEXT,
  convertedToOrderId TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  -- source: web | email | phone | distributor
  submittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customerEmail ON quotes(customerEmail);
CREATE INDEX IF NOT EXISTS idx_quotes_createdAt ON quotes(createdAt DESC);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  referenceId TEXT UNIQUE NOT NULL,
  customerId TEXT,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerCompany TEXT,
  quoteId TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | confirmed | processing | shipped | delivered | cancelled
  paymentStatus TEXT NOT NULL DEFAULT 'unpaid',
  -- paymentStatus: unpaid | partial | paid | refunded
  subtotal REAL NOT NULL DEFAULT 0,
  shippingCost REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  shippingRegion TEXT,
  shippingAddress TEXT,
  trackingNumber TEXT,
  adminNotes TEXT,
  confirmedAt TEXT,
  shippedAt TEXT,
  deliveredAt TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (quoteId) REFERENCES quotes(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paymentStatus ON orders(paymentStatus);
CREATE INDEX IF NOT EXISTS idx_orders_customerEmail ON orders(customerEmail);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productSlug TEXT NOT NULL,
  productName TEXT NOT NULL,
  qty REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  unitPrice REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  lineTotal REAL NOT NULL,
  notes TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL DEFAULT 'stripe',
  -- method: stripe | bank_transfer | other
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | succeeded | failed | refunded
  stripePaymentIntentId TEXT,
  stripeInvoiceId TEXT,
  paidAt TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_orderId ON payments(orderId);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
