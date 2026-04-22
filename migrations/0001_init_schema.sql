-- Cloudflare D1 Schema Migration
-- Initialize database tables for Covestro PC

-- Distributor Submissions Table
CREATE TABLE IF NOT EXISTS distributor_submissions (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  companyName TEXT NOT NULL,
  jobTitle TEXT NOT NULL,
  businessType TEXT NOT NULL,
  countries TEXT NOT NULL,
  estimatedAnnualVolume TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  submittedAt TEXT NOT NULL,
  referenceId TEXT UNIQUE NOT NULL,
  userAgent TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  submittedAt TEXT NOT NULL,
  referenceId TEXT UNIQUE NOT NULL,
  userAgent TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_distributor_email ON distributor_submissions(email);
CREATE INDEX IF NOT EXISTS idx_distributor_createdAt ON distributor_submissions(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_createdAt ON contact_submissions(createdAt DESC);
