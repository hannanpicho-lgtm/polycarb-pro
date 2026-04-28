import { createHmac } from 'crypto';
import { Resend } from 'resend';
import { siteConfig } from '@/lib/site-config';

type LeadKind = 'contact' | 'quote' | 'newsletter';

class WebhookDeliveryError extends Error {
  retryable: boolean;
  status?: number;

  constructor(message: string, options: { retryable: boolean; status?: number }) {
    super(message);
    this.name = 'WebhookDeliveryError';
    this.retryable = options.retryable;
    this.status = options.status;
  }
}

const resendApiKey = process.env['RESEND_API_KEY'];
const resendFrom =
  process.env['RESEND_FROM_EMAIL'] ?? `Leads <no-reply@${new URL(siteConfig.site.url).hostname}>`;
const resendTo = process.env['RESEND_TO_EMAIL'] ?? siteConfig.contact.salesEmail;

function normalizedString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function uniqueRecipients(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function resolveLeadRecipients(payload: Record<string, unknown>) {
  const routingTeam = normalizedString(payload['leadRoutingTeam']);
  const leadPriority = normalizedString(payload['leadPriority']);

  const routedPrimary =
    routingTeam === 'technical-sales'
      ? process.env['RESEND_TO_EMAIL_TECHNICAL_SALES']
      : routingTeam === 'marketing'
        ? process.env['RESEND_TO_EMAIL_MARKETING']
        : process.env['RESEND_TO_EMAIL_SALES'];

  const escalation =
    leadPriority === 'high'
      ? (process.env['RESEND_TO_EMAIL_HIGH_PRIORITY'] ?? process.env['RESEND_TO_EMAIL_ESCALATION'])
      : undefined;

  const recipients = uniqueRecipients([
    normalizedString(routedPrimary),
    normalizedString(resendTo),
    normalizedString(escalation),
  ]);

  return recipients.length > 0 ? recipients : [resendTo];
}

function buildLeadSubject(kind: LeadKind, payload: Record<string, unknown>) {
  const priority = normalizedString(payload['leadPriority'])?.toUpperCase();
  const queue = normalizedString(payload['leadRoutingQueue']);
  const company = normalizedString(payload['company']);
  const product = normalizedString(payload['product']);
  const subject = normalizedString(payload['subject']);
  const email = normalizedString(payload['email']);

  const labels = [priority ? `[${priority}]` : null, queue ? `[${queue}]` : null]
    .filter(Boolean)
    .join(' ');
  const context = company ?? product ?? subject ?? email ?? 'submission';

  return `${siteConfig.company.shortName} ${kind.toUpperCase()} LEAD ${labels} - ${context}`
    .replace(/\s+/g, ' ')
    .trim();
}

function compactRecord(entries: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(entries).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

function buildStructuredWebhookPayload(
  kind: LeadKind,
  payload: Record<string, unknown>,
  submittedAt: string
) {
  const submission = compactRecord({
    id: payload['_metaSubmissionId'],
    kind,
    submittedAt,
    ip: payload['_metaIp'],
    referer: payload['_metaReferer'],
    userAgent: payload['_metaUserAgent'],
  });

  const attribution = compactRecord({
    leadSource: payload['leadSource'],
    channel: payload['attributionChannel'],
    firstTouchChannel: payload['firstTouchAttributionChannel'],
    utmSource: payload['utmSource'],
    utmMedium: payload['utmMedium'],
    utmCampaign: payload['utmCampaign'],
    gclid: payload['gclid'],
    msclkid: payload['msclkid'],
    fbclid: payload['fbclid'],
    landingPath: payload['landingPath'],
    sourcePath: payload['sourcePath'],
    referrerHost: payload['referrerHost'],
    firstTouchUtmSource: payload['firstTouchUtmSource'],
    firstTouchUtmMedium: payload['firstTouchUtmMedium'],
    firstTouchUtmCampaign: payload['firstTouchUtmCampaign'],
    firstTouchGclid: payload['firstTouchGclid'],
    firstTouchMsclkid: payload['firstTouchMsclkid'],
    firstTouchFbclid: payload['firstTouchFbclid'],
    firstTouchLandingPath: payload['firstTouchLandingPath'],
    firstTouchReferrerHost: payload['firstTouchReferrerHost'],
    firstTouchAt: payload['attributionFirstTouchAt'],
    lastTouchAt: payload['attributionLastTouchAt'],
    daysToConversion: payload['attributionDaysToConversion'],
    summary: payload['attributionSummary'],
    firstTouchSummary: payload['firstTouchAttributionSummary'],
  });

  const qualification = compactRecord({
    score: payload['leadScore'],
    priority: payload['leadPriority'],
    intent: payload['leadIntent'],
  });

  const routing = compactRecord({
    team: payload['leadRoutingTeam'],
    queue: payload['leadRoutingQueue'],
    slaHours: payload['leadSlaHours'],
  });

  return {
    kind,
    source: siteConfig.company.shortName,
    submittedAt,
    submission,
    attribution,
    qualification,
    routing,
    payload,
  };
}

function toPlainTable(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${String(value ?? '')}`)
    .join('\n');
}

function toHtmlTable(payload: Record<string, unknown>): string {
  const rows = Object.entries(payload)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">${key}</td><td style="padding:8px;border:1px solid #e5e7eb;">${String(
          value ?? ''
        )}</td></tr>`
    )
    .join('');

  return `<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">${rows}</table>`;
}

function webhookDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitteredBackoffMs(baseMs: number, attempt: number) {
  const jitter = 0.85 + Math.random() * 0.3;
  return Math.round(baseMs * attempt * jitter);
}

function isRetryableWebhookError(error: unknown) {
  return error instanceof WebhookDeliveryError ? error.retryable : true;
}

async function postWebhookWithTimeout(
  url: string,
  body: string,
  bearer: string | undefined,
  timeoutMs: number,
  submissionId: string,
  attempt: number,
  submittedAt: string,
  signingSecret: string | undefined,
  signatureMaxAgeSeconds: number
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const idempotencyKey = `lead:${submissionId}`;

  const signaturePayload = `${submittedAt}.${body}`;
  const signature = signingSecret
    ? createHmac('sha256', signingSecret).update(signaturePayload).digest('hex')
    : undefined;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        'Idempotency-Key': idempotencyKey,
        'X-Lead-Submission-Id': submissionId,
        'X-Lead-Retry-Attempt': String(attempt),
        ...(signature
          ? {
              'X-Lead-Signature': `v1=${signature}`,
              'X-Lead-Signature-Timestamp': submittedAt,
              'X-Lead-Signature-Version': 'v1',
              'X-Lead-Signature-Max-Age-Seconds': String(signatureMaxAgeSeconds),
            }
          : {}),
      },
      body,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new WebhookDeliveryError(
        `CRM webhook failed with status ${response.status}. Body: ${responseText.slice(0, 300)}`,
        { retryable: response.status === 429 || response.status >= 500, status: response.status }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WebhookDeliveryError(`CRM webhook timed out after ${timeoutMs}ms`, {
        retryable: true,
      });
    }

    if (error instanceof WebhookDeliveryError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new WebhookDeliveryError(`CRM webhook network error: ${message}`, { retryable: true });
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendLeadEmail(kind: LeadKind, payload: Record<string, unknown>) {
  if (!resendApiKey) {
    throw new Error('Missing RESEND_API_KEY.');
  }

  const resend = new Resend(resendApiKey);
  const recipients = resolveLeadRecipients(payload);
  const subject = buildLeadSubject(kind, payload);

  await resend.emails.send({
    from: resendFrom,
    to: recipients,
    subject,
    text: toPlainTable(payload),
    html: toHtmlTable(payload),
    replyTo: typeof payload['email'] === 'string' ? payload['email'] : undefined,
  });
}

export async function sendLeadWebhook(kind: LeadKind, payload: Record<string, unknown>) {
  const webhookUrl = process.env['CRM_WEBHOOK_URL'];
  if (!webhookUrl) return;

  const timeoutMs = Number(process.env['CRM_WEBHOOK_TIMEOUT_MS'] ?? 8000);
  const bearer = process.env['CRM_WEBHOOK_BEARER_TOKEN'];
  const submittedAt = new Date().toISOString();
  const retries = Math.max(0, Math.min(5, Number(process.env['CRM_WEBHOOK_RETRIES'] ?? 2)));
  const retryBackoffMs = Math.max(50, Number(process.env['CRM_WEBHOOK_RETRY_BACKOFF_MS'] ?? 400));
  const failoverWebhookUrl = process.env['CRM_WEBHOOK_FAILOVER_URL']?.trim();
  const signingSecret = process.env['CRM_WEBHOOK_SIGNING_SECRET']?.trim();
  const signatureMaxAgeSeconds = Math.max(
    30,
    Math.min(24 * 60 * 60, Number(process.env['CRM_WEBHOOK_SIGNATURE_MAX_AGE_SECONDS'] ?? 300))
  );
  const endpoints = [webhookUrl, failoverWebhookUrl].filter((url): url is string => Boolean(url));
  const submissionId = normalizedString(payload['_metaSubmissionId']) ?? `${kind}-${submittedAt}`;

  const body = JSON.stringify(buildStructuredWebhookPayload(kind, payload, submittedAt));
  const errors: string[] = [];
  let encounteredNonRetryableError = false;

  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await postWebhookWithTimeout(
          endpoint,
          body,
          bearer,
          timeoutMs,
          submissionId,
          attempt + 1,
          submittedAt,
          signingSecret,
          signatureMaxAgeSeconds
        );
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const retryable = isRetryableWebhookError(error);
        errors.push(
          `endpoint=${endpoint} attempt=${attempt + 1}/${retries + 1} retryable=${retryable} error=${message}`
        );

        if (!retryable) {
          encounteredNonRetryableError = true;
          break;
        }

        if (attempt < retries) {
          await webhookDelay(jitteredBackoffMs(retryBackoffMs, attempt + 1));
        }
      }
    }

    if (encounteredNonRetryableError) {
      break;
    }
  }

  throw new Error(`CRM webhook delivery failed after retries. ${errors.join(' ; ')}`);
}
