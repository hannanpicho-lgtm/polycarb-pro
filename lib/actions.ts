'use server';

import { randomUUID } from 'crypto';
import { cookies, headers } from 'next/headers';
import { quoteRequestSchema, contactSchema, newsletterSchema } from '@/lib/schema';
import { sendLeadEmail, sendLeadWebhook } from '@/lib/lead-delivery';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { sendContactConfirmationEmail } from '@/lib/email';
import { saveContactSubmission } from '@/lib/database';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type LeadKind = 'quote' | 'contact' | 'newsletter';

type LeadPriority = 'low' | 'medium' | 'high';

type LeadIntent = 'quote-ready' | 'consultation' | 'spec-research' | 'newsletter';

type LeadRoutingTeam = 'sales' | 'technical-sales' | 'marketing';

interface LeadQualification {
  leadScore: number;
  leadPriority: LeadPriority;
  leadIntent: LeadIntent;
}

interface LeadRouting {
  leadRoutingTeam: LeadRoutingTeam;
  leadRoutingQueue: string;
  leadSlaHours: number;
}

interface DeliveryResult {
  webhookDelivered: boolean;
}

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; errors?: Record<string, string[]>; message?: string };

interface RequestContext {
  ip: string | null;
  referer: string | null;
  userAgent: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid: string | null;
  msclkid: string | null;
  fbclid: string | null;
  landingPath: string | null;
  referrerHost: string | null;
  firstTouchUtmSource: string | null;
  firstTouchUtmMedium: string | null;
  firstTouchUtmCampaign: string | null;
  firstTouchGclid: string | null;
  firstTouchMsclkid: string | null;
  firstTouchFbclid: string | null;
  firstTouchLandingPath: string | null;
  firstTouchReferrerHost: string | null;
  firstTouchAt: string | null;
  lastTouchAt: string | null;
}

async function getRequestContext() {
  const h = await headers();
  const c = await cookies();
  return {
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    referer: h.get('referer') ?? null,
    userAgent: h.get('user-agent') ?? null,
    utmSource: c.get('pc_utm_source')?.value ?? null,
    utmMedium: c.get('pc_utm_medium')?.value ?? null,
    utmCampaign: c.get('pc_utm_campaign')?.value ?? null,
    gclid: c.get('pc_gclid')?.value ?? null,
    msclkid: c.get('pc_msclkid')?.value ?? null,
    fbclid: c.get('pc_fbclid')?.value ?? null,
    landingPath: c.get('pc_landing_path')?.value ?? null,
    referrerHost: c.get('pc_referrer_host')?.value ?? null,
    firstTouchUtmSource: c.get('pc_ft_utm_source')?.value ?? null,
    firstTouchUtmMedium: c.get('pc_ft_utm_medium')?.value ?? null,
    firstTouchUtmCampaign: c.get('pc_ft_utm_campaign')?.value ?? null,
    firstTouchGclid: c.get('pc_ft_gclid')?.value ?? null,
    firstTouchMsclkid: c.get('pc_ft_msclkid')?.value ?? null,
    firstTouchFbclid: c.get('pc_ft_fbclid')?.value ?? null,
    firstTouchLandingPath: c.get('pc_ft_landing_path')?.value ?? null,
    firstTouchReferrerHost: c.get('pc_ft_referrer_host')?.value ?? null,
    firstTouchAt: c.get('pc_attr_first_touch_at')?.value ?? null,
    lastTouchAt: c.get('pc_attr_last_touch_at')?.value ?? null,
  };
}

function withSubmissionMeta(kind: LeadKind, payload: Record<string, unknown>, requestContext: RequestContext) {
  return {
    ...payload,
    _metaLeadKind: kind,
    _metaSubmissionId: `${kind}-${randomUUID()}`,
    _metaSubmittedAt: new Date().toISOString(),
    _metaIp: requestContext.ip ?? undefined,
    _metaReferer: requestContext.referer ?? undefined,
    _metaUserAgent: requestContext.userAgent ?? undefined,
  };
}

function withCookieFallback(value: string | undefined, fallback: string | null): string | undefined {
  const normalized = value?.trim();
  if (normalized) {
    return normalized;
  }
  return fallback ?? undefined;
}

function sourcePathFromReferer(referer: string | null): string | undefined {
  if (!referer) {
    return undefined;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return undefined;
  }
}

function firstTouchAttributionSummary(requestContext: RequestContext): string | undefined {
  return [
    requestContext.firstTouchUtmSource ? `utm_source=${requestContext.firstTouchUtmSource}` : null,
    requestContext.firstTouchUtmMedium ? `utm_medium=${requestContext.firstTouchUtmMedium}` : null,
    requestContext.firstTouchUtmCampaign ? `utm_campaign=${requestContext.firstTouchUtmCampaign}` : null,
    requestContext.firstTouchGclid ? `gclid=${requestContext.firstTouchGclid}` : null,
    requestContext.firstTouchMsclkid ? `msclkid=${requestContext.firstTouchMsclkid}` : null,
    requestContext.firstTouchFbclid ? `fbclid=${requestContext.firstTouchFbclid}` : null,
    requestContext.firstTouchLandingPath ? `landing=${requestContext.firstTouchLandingPath}` : null,
    requestContext.firstTouchReferrerHost ? `referrer_host=${requestContext.firstTouchReferrerHost}` : null,
  ].filter(Boolean).join(' | ') || undefined;
}

function isSearchEngineHost(host: string | null) {
  if (!host) {
    return false;
  }

  return [
    'google.',
    'bing.com',
    'search.yahoo.',
    'duckduckgo.com',
    'search.brave.com',
    'ecosia.org',
    'yandex.',
    'baidu.com',
  ].some((needle) => host.includes(needle));
}

function deriveAttributionChannel(values: {
  utmSource?: string | null;
  utmMedium?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  fbclid?: string | null;
  referrerHost?: string | null;
}) {
  const utmSource = values.utmSource?.trim().toLowerCase() ?? '';
  const utmMedium = values.utmMedium?.trim().toLowerCase() ?? '';

  if (values.gclid || values.msclkid || values.fbclid) {
    return 'paid';
  }

  if (['cpc', 'ppc', 'paid', 'paid-social', 'display', 'retargeting'].some((token) => utmMedium.includes(token))) {
    return 'paid';
  }

  if (utmMedium.includes('email') || utmSource.includes('newsletter')) {
    return 'email';
  }

  if (isSearchEngineHost(values.referrerHost ?? null)) {
    return 'organic';
  }

  if (values.referrerHost) {
    return 'referral';
  }

  return 'direct';
}

function parseIsoDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function conversionLagDays(firstTouchAt: string | null, referenceDate: Date): number | undefined {
  const firstTouchDate = parseIsoDate(firstTouchAt);
  if (!firstTouchDate) {
    return undefined;
  }

  const lagMs = referenceDate.getTime() - firstTouchDate.getTime();
  if (lagMs < 0) {
    return 0;
  }

  return Number((lagMs / (1000 * 60 * 60 * 24)).toFixed(3));
}

function scoreToPriority(score: number): LeadPriority {
  if (score >= 75) {
    return 'high';
  }

  if (score >= 45) {
    return 'medium';
  }

  return 'low';
}

function computeQuoteQualification(input: {
  company?: string;
  phone?: string;
  quantity?: string;
  message: string;
  compareCount: number;
  attributionChannel: string;
  attributionDaysToConversion?: number;
}): LeadQualification {
  let score = 45;

  if (input.company?.trim()) score += 10;
  if (input.phone?.trim()) score += 8;
  if (input.quantity?.trim()) score += 10;
  if (input.compareCount > 0) score += 8;
  if (input.message.trim().length >= 120) score += 8;
  else if (input.message.trim().length >= 50) score += 4;
  if (input.attributionChannel === 'paid' || input.attributionChannel === 'email') score += 5;
  if (input.attributionDaysToConversion !== undefined && input.attributionDaysToConversion <= 7) score += 6;

  return {
    leadScore: Math.min(score, 100),
    leadPriority: scoreToPriority(score),
    leadIntent: 'quote-ready',
  };
}

function computeContactQualification(input: {
  company?: string;
  subject: string;
  message: string;
  compareCount: number;
  attributionChannel: string;
  attributionDaysToConversion?: number;
}): LeadQualification {
  let score = 28;
  const subject = input.subject.toLowerCase();
  const message = input.message.toLowerCase();
  const buyingSignal = /(quote|price|pricing|sample|stock|bulk|order|lead time|spec|datasheet|rfq)/;

  if (input.company?.trim()) score += 10;
  if (buyingSignal.test(subject) || buyingSignal.test(message)) score += 14;
  if (input.compareCount > 0) score += 8;
  if (input.message.trim().length >= 160) score += 8;
  else if (input.message.trim().length >= 60) score += 4;
  if (input.attributionChannel === 'paid' || input.attributionChannel === 'email') score += 4;
  if (input.attributionDaysToConversion !== undefined && input.attributionDaysToConversion <= 7) score += 5;

  return {
    leadScore: Math.min(score, 100),
    leadPriority: scoreToPriority(score),
    leadIntent: buyingSignal.test(subject) || buyingSignal.test(message) ? 'consultation' : 'spec-research',
  };
}

function computeNewsletterQualification(input: {
  attributionChannel: string;
  attributionDaysToConversion?: number;
}): LeadQualification {
  let score = 12;

  if (input.attributionChannel === 'paid') score += 6;
  else if (input.attributionChannel === 'organic' || input.attributionChannel === 'referral') score += 3;
  if (input.attributionDaysToConversion !== undefined && input.attributionDaysToConversion <= 3) score += 4;

  return {
    leadScore: Math.min(score, 100),
    leadPriority: scoreToPriority(score),
    leadIntent: 'newsletter',
  };
}

function deriveLeadRouting(kind: LeadKind, qualification: LeadQualification): LeadRouting {
  if (kind === 'newsletter') {
    return {
      leadRoutingTeam: 'marketing',
      leadRoutingQueue: qualification.leadPriority === 'high' ? 'marketing-priority' : 'marketing-nurture',
      leadSlaHours: qualification.leadPriority === 'high' ? 24 : 72,
    };
  }

  if (qualification.leadIntent === 'spec-research') {
    return {
      leadRoutingTeam: 'technical-sales',
      leadRoutingQueue: qualification.leadPriority === 'high' ? 'technical-priority' : 'technical-general',
      leadSlaHours: qualification.leadPriority === 'high' ? 4 : 12,
    };
  }

  return {
    leadRoutingTeam: 'sales',
    leadRoutingQueue: qualification.leadPriority === 'high' ? 'sales-priority' : 'sales-general',
    leadSlaHours: qualification.leadPriority === 'high' ? 2 : qualification.leadPriority === 'medium' ? 8 : 24,
  };
}

async function deliverLeadWithOptionalWebhook(kind: LeadKind, payload: Record<string, unknown>): Promise<DeliveryResult> {
  await sendLeadEmail(kind, payload);

  try {
    await sendLeadWebhook(kind, payload);
    return { webhookDelivered: true };
  } catch (error) {
    const submissionId = typeof payload['_metaSubmissionId'] === 'string' ? payload['_metaSubmissionId'] : 'unknown';
    console.warn(`[lead:${kind}] webhook delivery failed (submissionId=${submissionId})`, error);
    return { webhookDelivered: false };
  }
}

function blockedBySpamGuard(raw: Record<string, FormDataEntryValue>) {
  const honeypot = String(raw['companyWebsite'] ?? '').trim();
  const submittedAt = Number(raw['submittedAt'] ?? 0);
  const ageMs = Number.isFinite(submittedAt) ? Date.now() - submittedAt : 0;

  if (honeypot.length > 0) {
    return true;
  }

  // Block unrealistically fast submissions (likely bots)
  if (!submittedAt || ageMs < 1200) {
    return true;
  }

  return false;
}

export async function submitQuoteRequest(
  _prevState: ActionResult<{ submissionId?: string; webhookDelivered: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ submissionId?: string; webhookDelivered: boolean }>> {
  const raw = Object.fromEntries(formData.entries());

  if (blockedBySpamGuard(raw)) {
    return { success: false, message: 'Submission blocked. Please try again.' };
  }

  const requestContext = await getRequestContext();
  const allowed = checkRateLimit(getRateLimitKey('quote', requestContext.ip), 5, 10 * 60 * 1000);
  if (!allowed) {
    return {
      success: false,
      message: 'Too many requests. Please wait a few minutes before trying again.',
    };
  }

  const parsed = quoteRequestSchema.safeParse({
    ...raw,
    acceptTerms: raw['acceptTerms'] === 'on' ? true : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Please correct the errors below.',
    };
  }

  const compareSlugs = parsed.data.compareSlugs
    ? parsed.data.compareSlugs.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const utmSource = withCookieFallback(parsed.data.utmSource, requestContext.utmSource);
  const utmMedium = withCookieFallback(parsed.data.utmMedium, requestContext.utmMedium);
  const utmCampaign = withCookieFallback(parsed.data.utmCampaign, requestContext.utmCampaign);
  const gclid = withCookieFallback(parsed.data.gclid, requestContext.gclid);
  const msclkid = withCookieFallback(parsed.data.msclkid, requestContext.msclkid);
  const fbclid = withCookieFallback(parsed.data.fbclid, requestContext.fbclid);
  const landingPath = withCookieFallback(parsed.data.landingPath, requestContext.landingPath);
  const sourcePath = parsed.data.sourcePath?.trim() || sourcePathFromReferer(requestContext.referer);
  const firstTouchSummary = firstTouchAttributionSummary(requestContext);
  const submittedAt = new Date();
  const attributionDaysToConversion = conversionLagDays(requestContext.firstTouchAt, submittedAt);
  const attributionChannel = deriveAttributionChannel({
    utmSource,
    utmMedium,
    gclid,
    msclkid,
    fbclid,
    referrerHost: requestContext.referrerHost,
  });
  const firstTouchAttributionChannel = deriveAttributionChannel({
    utmSource: requestContext.firstTouchUtmSource,
    utmMedium: requestContext.firstTouchUtmMedium,
    gclid: requestContext.firstTouchGclid,
    msclkid: requestContext.firstTouchMsclkid,
    fbclid: requestContext.firstTouchFbclid,
    referrerHost: requestContext.firstTouchReferrerHost,
  });
  const qualification = computeQuoteQualification({
    company: parsed.data.company,
    phone: parsed.data.phone,
    quantity: parsed.data.quantity,
    message: parsed.data.message,
    compareCount: compareSlugs.length,
    attributionChannel,
    attributionDaysToConversion,
  });
  const routing = deriveLeadRouting('quote', qualification);

  const enrichedPayload = {
    ...parsed.data,
    utmSource,
    utmMedium,
    utmCampaign,
    gclid,
    msclkid,
    fbclid,
    landingPath,
    referrerHost: requestContext.referrerHost ?? undefined,
    sourcePath,
    attributionChannel,
    leadScore: qualification.leadScore,
    leadPriority: qualification.leadPriority,
    leadIntent: qualification.leadIntent,
    leadRoutingTeam: routing.leadRoutingTeam,
    leadRoutingQueue: routing.leadRoutingQueue,
    leadSlaHours: routing.leadSlaHours,
    firstTouchUtmSource: requestContext.firstTouchUtmSource ?? undefined,
    firstTouchUtmMedium: requestContext.firstTouchUtmMedium ?? undefined,
    firstTouchUtmCampaign: requestContext.firstTouchUtmCampaign ?? undefined,
    firstTouchGclid: requestContext.firstTouchGclid ?? undefined,
    firstTouchMsclkid: requestContext.firstTouchMsclkid ?? undefined,
    firstTouchFbclid: requestContext.firstTouchFbclid ?? undefined,
    firstTouchLandingPath: requestContext.firstTouchLandingPath ?? undefined,
    firstTouchReferrerHost: requestContext.firstTouchReferrerHost ?? undefined,
    firstTouchAttributionChannel,
    attributionFirstTouchAt: requestContext.firstTouchAt ?? undefined,
    attributionLastTouchAt: requestContext.lastTouchAt ?? undefined,
    attributionDaysToConversion,
    firstTouchAttributionSummary: firstTouchSummary,
    compareCount: compareSlugs.length,
    hasCompareContext: compareSlugs.length > 0,
    attributionSummary: [
      parsed.data.leadSource ? `source=${parsed.data.leadSource}` : null,
      utmSource ? `utm_source=${utmSource}` : null,
      utmMedium ? `utm_medium=${utmMedium}` : null,
      utmCampaign ? `utm_campaign=${utmCampaign}` : null,
      gclid ? `gclid=${gclid}` : null,
      msclkid ? `msclkid=${msclkid}` : null,
      fbclid ? `fbclid=${fbclid}` : null,
      landingPath ? `landing=${landingPath}` : null,
      requestContext.referrerHost ? `referrer_host=${requestContext.referrerHost}` : null,
      `channel=${attributionChannel}`,
      `first_touch_channel=${firstTouchAttributionChannel}`,
      `score=${qualification.leadScore}`,
      `priority=${qualification.leadPriority}`,
      `intent=${qualification.leadIntent}`,
      `route_team=${routing.leadRoutingTeam}`,
      `route_queue=${routing.leadRoutingQueue}`,
      `sla_hours=${routing.leadSlaHours}`,
      requestContext.firstTouchAt ? `first_touch_at=${requestContext.firstTouchAt}` : null,
      requestContext.lastTouchAt ? `last_touch_at=${requestContext.lastTouchAt}` : null,
      attributionDaysToConversion !== undefined ? `days_to_conversion=${attributionDaysToConversion}` : null,
      parsed.data.compareOnlyDiff ? `onlydiff=${parsed.data.compareOnlyDiff}` : null,
      sourcePath ? `path=${sourcePath}` : null,
    ].filter(Boolean).join(' | '),
  };

  const payloadWithMeta = withSubmissionMeta('quote', enrichedPayload, requestContext);
  const submissionId = String(payloadWithMeta['_metaSubmissionId'] ?? '');

  try {
    const delivery = await deliverLeadWithOptionalWebhook('quote', payloadWithMeta);
    return {
      success: true,
      data: { submissionId, webhookDelivered: delivery.webhookDelivered },
      message: 'Your quote request has been received. Our team will contact you within 1 business day.',
    };
  } catch (error) {
    console.error('submitQuoteRequest failed', error);
    return {
      success: false,
      message: 'We could not submit your quote request right now. Please try again in a moment.',
    };
  }
}

export async function submitContactForm(
  _prevState: ActionResult<{ submissionId?: string; webhookDelivered: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ submissionId?: string; webhookDelivered: boolean }>> {
  const raw = Object.fromEntries(formData.entries());

  if (blockedBySpamGuard(raw)) {
    return { success: false, message: 'Submission blocked. Please try again.' };
  }

  const requestContext = await getRequestContext();
  const allowed = checkRateLimit(getRateLimitKey('contact', requestContext.ip), 4, 10 * 60 * 1000);
  if (!allowed) {
    return {
      success: false,
      message: 'Too many requests. Please wait a few minutes before trying again.',
    };
  }

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Please correct the errors below.',
    };
  }

  const compareSlugs = parsed.data.compareSlugs
    ? parsed.data.compareSlugs.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const utmSource = withCookieFallback(parsed.data.utmSource, requestContext.utmSource);
  const utmMedium = withCookieFallback(parsed.data.utmMedium, requestContext.utmMedium);
  const utmCampaign = withCookieFallback(parsed.data.utmCampaign, requestContext.utmCampaign);
  const gclid = withCookieFallback(parsed.data.gclid, requestContext.gclid);
  const msclkid = withCookieFallback(parsed.data.msclkid, requestContext.msclkid);
  const fbclid = withCookieFallback(parsed.data.fbclid, requestContext.fbclid);
  const landingPath = withCookieFallback(parsed.data.landingPath, requestContext.landingPath);
  const sourcePath = parsed.data.sourcePath?.trim() || sourcePathFromReferer(requestContext.referer);
  const firstTouchSummary = firstTouchAttributionSummary(requestContext);
  const submittedAt = new Date();
  const attributionDaysToConversion = conversionLagDays(requestContext.firstTouchAt, submittedAt);
  const attributionChannel = deriveAttributionChannel({
    utmSource,
    utmMedium,
    gclid,
    msclkid,
    fbclid,
    referrerHost: requestContext.referrerHost,
  });
  const firstTouchAttributionChannel = deriveAttributionChannel({
    utmSource: requestContext.firstTouchUtmSource,
    utmMedium: requestContext.firstTouchUtmMedium,
    gclid: requestContext.firstTouchGclid,
    msclkid: requestContext.firstTouchMsclkid,
    fbclid: requestContext.firstTouchFbclid,
    referrerHost: requestContext.firstTouchReferrerHost,
  });
  const qualification = computeContactQualification({
    company: parsed.data.company,
    subject: parsed.data.subject,
    message: parsed.data.message,
    compareCount: compareSlugs.length,
    attributionChannel,
    attributionDaysToConversion,
  });
  const routing = deriveLeadRouting('contact', qualification);

  const enrichedPayload = {
    ...parsed.data,
    utmSource,
    utmMedium,
    utmCampaign,
    gclid,
    msclkid,
    fbclid,
    landingPath,
    referrerHost: requestContext.referrerHost ?? undefined,
    sourcePath,
    attributionChannel,
    leadScore: qualification.leadScore,
    leadPriority: qualification.leadPriority,
    leadIntent: qualification.leadIntent,
    leadRoutingTeam: routing.leadRoutingTeam,
    leadRoutingQueue: routing.leadRoutingQueue,
    leadSlaHours: routing.leadSlaHours,
    firstTouchUtmSource: requestContext.firstTouchUtmSource ?? undefined,
    firstTouchUtmMedium: requestContext.firstTouchUtmMedium ?? undefined,
    firstTouchUtmCampaign: requestContext.firstTouchUtmCampaign ?? undefined,
    firstTouchGclid: requestContext.firstTouchGclid ?? undefined,
    firstTouchMsclkid: requestContext.firstTouchMsclkid ?? undefined,
    firstTouchFbclid: requestContext.firstTouchFbclid ?? undefined,
    firstTouchLandingPath: requestContext.firstTouchLandingPath ?? undefined,
    firstTouchReferrerHost: requestContext.firstTouchReferrerHost ?? undefined,
    firstTouchAttributionChannel,
    attributionFirstTouchAt: requestContext.firstTouchAt ?? undefined,
    attributionLastTouchAt: requestContext.lastTouchAt ?? undefined,
    attributionDaysToConversion,
    firstTouchAttributionSummary: firstTouchSummary,
    compareCount: compareSlugs.length,
    hasCompareContext: compareSlugs.length > 0,
    attributionSummary: [
      parsed.data.leadSource ? `source=${parsed.data.leadSource}` : null,
      utmSource ? `utm_source=${utmSource}` : null,
      utmMedium ? `utm_medium=${utmMedium}` : null,
      utmCampaign ? `utm_campaign=${utmCampaign}` : null,
      gclid ? `gclid=${gclid}` : null,
      msclkid ? `msclkid=${msclkid}` : null,
      fbclid ? `fbclid=${fbclid}` : null,
      landingPath ? `landing=${landingPath}` : null,
      requestContext.referrerHost ? `referrer_host=${requestContext.referrerHost}` : null,
      `channel=${attributionChannel}`,
      `first_touch_channel=${firstTouchAttributionChannel}`,
      `score=${qualification.leadScore}`,
      `priority=${qualification.leadPriority}`,
      `intent=${qualification.leadIntent}`,
      `route_team=${routing.leadRoutingTeam}`,
      `route_queue=${routing.leadRoutingQueue}`,
      `sla_hours=${routing.leadSlaHours}`,
      requestContext.firstTouchAt ? `first_touch_at=${requestContext.firstTouchAt}` : null,
      requestContext.lastTouchAt ? `last_touch_at=${requestContext.lastTouchAt}` : null,
      attributionDaysToConversion !== undefined ? `days_to_conversion=${attributionDaysToConversion}` : null,
      parsed.data.compareOnlyDiff ? `onlydiff=${parsed.data.compareOnlyDiff}` : null,
      sourcePath ? `path=${sourcePath}` : null,
    ].filter(Boolean).join(' | '),
  };

  const payloadWithMeta = withSubmissionMeta('contact', enrichedPayload, requestContext);
  const submissionId = String(payloadWithMeta['_metaSubmissionId'] ?? '');

  try {
    const delivery = await deliverLeadWithOptionalWebhook('contact', payloadWithMeta);

    // Persist to D1 (best-effort — failure does not block the user)
    try {
      const { env } = await getCloudflareContext({ async: true });
      const db = (env as Record<string, unknown>)['DB'] as import('@cloudflare/workers-types').D1Database | undefined;
      if (db) {
        await saveContactSubmission(
          db,
          {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: parsed.data.email,
            company: parsed.data.company,
            subject: parsed.data.subject,
            message: parsed.data.message,
          },
          submissionId,
          requestContext.userAgent ?? undefined,
          requestContext.ip ?? undefined,
        );
      }
    } catch (dbErr) {
      console.warn('[contact] D1 write failed (non-fatal):', dbErr);
    }

    // Send confirmation email to the person who submitted
    const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
    const emailResult = await sendContactConfirmationEmail(parsed.data.email, fullName);
    if (!emailResult.ok) {
      console.warn('Failed to send contact confirmation email:', emailResult.error);
      // Don't fail the submission just because email failed
    }
    
    return {
      success: true,
      data: { submissionId, webhookDelivered: delivery.webhookDelivered },
      message: "Thank you! We've received your message and will respond within 2 business days.",
    };
  } catch (error) {
    console.error('submitContactForm failed', error);
    return {
      success: false,
      message: 'Your message could not be delivered right now. Please try again in a moment.',
    };
  }
}

export async function subscribeNewsletter(
  _prevState: ActionResult<{ submissionId?: string; webhookDelivered: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ submissionId?: string; webhookDelivered: boolean }>> {
  const raw = Object.fromEntries(formData.entries());

  if (blockedBySpamGuard(raw)) {
    return { success: false, message: 'Submission blocked. Please try again.' };
  }

  const requestContext = await getRequestContext();
  const allowed = checkRateLimit(getRateLimitKey('newsletter', requestContext.ip), 6, 10 * 60 * 1000);
  if (!allowed) {
    return {
      success: false,
      message: 'Too many requests. Please wait a few minutes before trying again.',
    };
  }

  const parsed = newsletterSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Invalid email address.',
    };
  }

  const newsletterSourcePath = sourcePathFromReferer(requestContext.referer);
  const newsletterLandingPath = requestContext.landingPath ?? newsletterSourcePath;
  const firstTouchSummary = firstTouchAttributionSummary(requestContext);
  const submittedAt = new Date();
  const attributionDaysToConversion = conversionLagDays(requestContext.firstTouchAt, submittedAt);
  const attributionChannel = deriveAttributionChannel({
    utmSource: requestContext.utmSource,
    utmMedium: requestContext.utmMedium,
    gclid: requestContext.gclid,
    msclkid: requestContext.msclkid,
    fbclid: requestContext.fbclid,
    referrerHost: requestContext.referrerHost,
  });
  const firstTouchAttributionChannel = deriveAttributionChannel({
    utmSource: requestContext.firstTouchUtmSource,
    utmMedium: requestContext.firstTouchUtmMedium,
    gclid: requestContext.firstTouchGclid,
    msclkid: requestContext.firstTouchMsclkid,
    fbclid: requestContext.firstTouchFbclid,
    referrerHost: requestContext.firstTouchReferrerHost,
  });
  const qualification = computeNewsletterQualification({
    attributionChannel,
    attributionDaysToConversion,
  });
  const routing = deriveLeadRouting('newsletter', qualification);
  const newsletterPayload = {
    ...parsed.data,
    leadSource: 'newsletter-form',
    utmSource: requestContext.utmSource ?? undefined,
    utmMedium: requestContext.utmMedium ?? undefined,
    utmCampaign: requestContext.utmCampaign ?? undefined,
    gclid: requestContext.gclid ?? undefined,
    msclkid: requestContext.msclkid ?? undefined,
    fbclid: requestContext.fbclid ?? undefined,
    landingPath: newsletterLandingPath,
    referrerHost: requestContext.referrerHost ?? undefined,
    sourcePath: newsletterSourcePath,
    attributionChannel,
    leadScore: qualification.leadScore,
    leadPriority: qualification.leadPriority,
    leadIntent: qualification.leadIntent,
    leadRoutingTeam: routing.leadRoutingTeam,
    leadRoutingQueue: routing.leadRoutingQueue,
    leadSlaHours: routing.leadSlaHours,
    firstTouchUtmSource: requestContext.firstTouchUtmSource ?? undefined,
    firstTouchUtmMedium: requestContext.firstTouchUtmMedium ?? undefined,
    firstTouchUtmCampaign: requestContext.firstTouchUtmCampaign ?? undefined,
    firstTouchGclid: requestContext.firstTouchGclid ?? undefined,
    firstTouchMsclkid: requestContext.firstTouchMsclkid ?? undefined,
    firstTouchFbclid: requestContext.firstTouchFbclid ?? undefined,
    firstTouchLandingPath: requestContext.firstTouchLandingPath ?? undefined,
    firstTouchReferrerHost: requestContext.firstTouchReferrerHost ?? undefined,
    firstTouchAttributionChannel,
    attributionFirstTouchAt: requestContext.firstTouchAt ?? undefined,
    attributionLastTouchAt: requestContext.lastTouchAt ?? undefined,
    attributionDaysToConversion,
    firstTouchAttributionSummary: firstTouchSummary,
    attributionSummary: [
      'source=newsletter-form',
      requestContext.utmSource ? `utm_source=${requestContext.utmSource}` : null,
      requestContext.utmMedium ? `utm_medium=${requestContext.utmMedium}` : null,
      requestContext.utmCampaign ? `utm_campaign=${requestContext.utmCampaign}` : null,
      requestContext.gclid ? `gclid=${requestContext.gclid}` : null,
      requestContext.msclkid ? `msclkid=${requestContext.msclkid}` : null,
      requestContext.fbclid ? `fbclid=${requestContext.fbclid}` : null,
      newsletterLandingPath ? `landing=${newsletterLandingPath}` : null,
      requestContext.referrerHost ? `referrer_host=${requestContext.referrerHost}` : null,
      `channel=${attributionChannel}`,
      `first_touch_channel=${firstTouchAttributionChannel}`,
      `score=${qualification.leadScore}`,
      `priority=${qualification.leadPriority}`,
      `intent=${qualification.leadIntent}`,
      `route_team=${routing.leadRoutingTeam}`,
      `route_queue=${routing.leadRoutingQueue}`,
      `sla_hours=${routing.leadSlaHours}`,
      requestContext.firstTouchAt ? `first_touch_at=${requestContext.firstTouchAt}` : null,
      requestContext.lastTouchAt ? `last_touch_at=${requestContext.lastTouchAt}` : null,
      attributionDaysToConversion !== undefined ? `days_to_conversion=${attributionDaysToConversion}` : null,
      newsletterSourcePath ? `path=${newsletterSourcePath}` : null,
    ].filter(Boolean).join(' | '),
  };

  const payloadWithMeta = withSubmissionMeta('newsletter', newsletterPayload, requestContext);
  const submissionId = String(payloadWithMeta['_metaSubmissionId'] ?? '');

  try {
    const delivery = await deliverLeadWithOptionalWebhook('newsletter', payloadWithMeta);
    return {
      success: true,
      data: { submissionId, webhookDelivered: delivery.webhookDelivered },
      message: "You're subscribed! Expect our next industry digest soon.",
    };
  } catch (error) {
    console.error('subscribeNewsletter failed', error);
    return {
      success: false,
      message: 'Subscription is currently unavailable. Please try again shortly.',
    };
  }
}
