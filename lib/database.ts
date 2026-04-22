import { D1Database } from '@cloudflare/workers-types';

export interface DistributorSubmission {
  id?: string;
  fullName: string;
  companyName: string;
  jobTitle: string;
  businessType: string;
  countries: string[];
  estimatedAnnualVolume: string;
  email: string;
  phone: string;
  message?: string;
  submittedAt?: string;
  referenceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ContactSubmission {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  submittedAt?: string;
  referenceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function initializeDatabase(db: D1Database) {
  // Create distributor_submissions table
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS distributor_submissions (
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
      )`
    )
    .run();

  // Create contact_submissions table
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_submissions (
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
      )`
    )
    .run();

  console.log('Database tables initialized successfully');
}

export async function saveDistributorSubmission(
  db: D1Database,
  data: DistributorSubmission,
  referenceId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await db
      .prepare(
        `INSERT INTO distributor_submissions (
          id, fullName, companyName, jobTitle, businessType, countries,
          estimatedAnnualVolume, email, phone, message, submittedAt, referenceId,
          userAgent, ipAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.fullName,
        data.companyName,
        data.jobTitle,
        data.businessType,
        JSON.stringify(data.countries),
        data.estimatedAnnualVolume,
        data.email,
        data.phone,
        data.message || null,
        now,
        referenceId,
        userAgent || null,
        ipAddress || null
      )
      .run();

    return { success: true, id, referenceId };
  } catch (error) {
    console.error('Failed to save distributor submission:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveContactSubmission(
  db: D1Database,
  data: ContactSubmission,
  referenceId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await db
      .prepare(
        `INSERT INTO contact_submissions (
          id, firstName, lastName, email, company, subject, message,
          submittedAt, referenceId, userAgent, ipAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.firstName,
        data.lastName,
        data.email,
        data.company || null,
        data.subject,
        data.message,
        now,
        referenceId,
        userAgent || null,
        ipAddress || null
      )
      .run();

    return { success: true, id, referenceId };
  } catch (error) {
    console.error('Failed to save contact submission:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getDistributorSubmissions(
  db: D1Database,
  limit: number = 50,
  offset: number = 0,
  emailFilter?: string
) {
  try {
    let query = 'SELECT * FROM distributor_submissions';
    const params: any[] = [];

    if (emailFilter) {
      query += ' WHERE email LIKE ?';
      params.push(`%${emailFilter}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.prepare(query).bind(...params).all();

    // Return results directly for API usage
    return result.results || [];
  } catch (error) {
    console.error('Failed to fetch distributor submissions:', error);
    return [];
  }
}

export async function getContactSubmissions(db: D1Database, limit: number = 50, offset: number = 0) {
  try {
    const result = await db
      .prepare(`SELECT * FROM contact_submissions ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
      .bind(limit, offset)
      .all();

    return { success: true, data: result.results || [] };
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
  }
}

export async function getSubmissionByReferenceId(db: D1Database, referenceId: string, type: 'distributor' | 'contact') {
  const table = type === 'distributor' ? 'distributor_submissions' : 'contact_submissions';

  try {
    const result = await db.prepare(`SELECT * FROM ${table} WHERE referenceId = ? LIMIT 1`).bind(referenceId).first();

    return { success: true, data: result };
  } catch (error) {
    console.error(`Failed to fetch ${type} submission:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: null };
  }
}

export async function getSubmissionStats(db: D1Database) {
  try {
    const distributorCount = await db
      .prepare(`SELECT COUNT(*) as count FROM distributor_submissions`)
      .first<{ count: number }>();

    const contactCount = await db
      .prepare(`SELECT COUNT(*) as count FROM contact_submissions`)
      .first<{ count: number }>();

    return {
      distributorSubmissions: distributorCount?.count || 0,
      contactSubmissions: contactCount?.count || 0,
      totalSubmissions: (distributorCount?.count || 0) + (contactCount?.count || 0),
    };
  } catch (error) {
    console.error('Failed to fetch submission stats:', error);
    return {
      distributorSubmissions: 0,
      contactSubmissions: 0,
      totalSubmissions: 0,
    };
  }
}
