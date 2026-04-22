/**
 * Covestro PC — Transactional email helpers (Resend)
 *
 * All HTML is self-contained inline-CSS so it renders well in Gmail,
 * Outlook, Apple Mail, etc.
 */
import { Resend } from 'resend';

const RESEND_KEY = process.env.RESEND_API_KEY ?? '';
const FROM_ORDERS = 'Covestro Polycarbonates <orders@covestroppc.com>';
const FROM_NOREPLY = 'Covestro PC <noreply@covestroppc.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.RESEND_TO_EMAIL ?? 'admin@covestroppc.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covestroppc.com';

function resend() { return new Resend(RESEND_KEY); }

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Covestro Polycarbonates</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Brand header -->
  <tr><td style="background:#0087C3;padding:28px 32px;border-radius:12px 12px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;color:rgba(255,255,255,0.75);font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">Covestro Polycarbonates</p></td>
      <td align="right"><p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px">covestroppc.com</p></td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
    ${body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
      © 2026 Covestro Polycarbonates &nbsp;·&nbsp;
      <a href="${SITE_URL}" style="color:#0087C3;text-decoration:none">covestroppc.com</a>
      &nbsp;·&nbsp; You're receiving this because you have an account or enquiry with us.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#0087C3;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;margin:16px 0">${text} →</a>`;
}

function refBadge(ref: string) {
  return `<span style="display:inline-block;background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;border-radius:6px;padding:3px 10px;font-size:12px;font-family:monospace;font-weight:700">${ref}</span>`;
}

// ── 1. Quote submitted — confirmation to customer ─────────────────────────────
export async function sendQuoteSubmittedConfirmation(opts: {
  to: string;
  name: string;
  referenceId: string;
  products: { name: string; qty: number; unit: string }[];
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const rows = opts.products.map(p =>
    `<tr>
       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151">${p.name}</td>
       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:right">${p.qty} ${p.unit}</td>
     </tr>`
  ).join('');

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.2">Quote Request Received</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${opts.name.split(' ')[0]}, we've received your request and our team will prepare a price within 1–2 business days.</p>

<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Your Reference</p>
<p style="margin:0 0 24px">${refBadge(opts.referenceId)}</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px">
  <tr style="background:#f8fafc">
    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:left;text-transform:uppercase;letter-spacing:0.05em">Product</th>
    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:right;text-transform:uppercase;letter-spacing:0.05em">Quantity</th>
  </tr>
  <tbody>${rows}</tbody>
</table>

<p style="margin:0 0 4px;font-size:13px;color:#475569">Keep your reference number handy — you can use it to track progress at any time:</p>
${btn('Track my quote', `${SITE_URL}/track?ref=${opts.referenceId}`)}

<p style="margin:16px 0 0;font-size:12px;color:#94a3b8">Questions? Reply to this email or call <strong>+1 (713) 555-0172</strong>.</p>`;

  const { error } = await resend().emails.send({
    from: FROM_ORDERS,
    to: [opts.to],
    subject: `Quote received — ${opts.referenceId}`,
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 2. New quote alert — to admin ─────────────────────────────────────────────
export async function sendNewQuoteAdminAlert(opts: {
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  products: { name: string; qty: number; unit: string }[];
  message?: string;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const rows = opts.products.map(p =>
    `<tr>
       <td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">${p.name}</td>
       <td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right">${p.qty} ${p.unit}</td>
     </tr>`
  ).join('');

  const body = `
<h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a">New Quote Request</h1>
<p style="margin:0 0 20px;font-size:14px;color:#64748b">A new quote was submitted via the website.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">Reference</td><td>${refBadge(opts.referenceId)}</td></tr>
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Customer</td><td style="font-size:13px;font-weight:600;color:#0f172a">${opts.customerName}</td></tr>
  ${opts.customerCompany ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b">Company</td><td style="font-size:13px;color:#374151">${opts.customerCompany}</td></tr>` : ''}
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Email</td><td><a href="mailto:${opts.customerEmail}" style="color:#0087C3;font-size:13px">${opts.customerEmail}</a></td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">
  <tr style="background:#f8fafc">
    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:left;text-transform:uppercase">Products requested</th>
    <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-align:right;text-transform:uppercase">Qty</th>
  </tr>
  <tbody>${rows}</tbody>
</table>

${opts.message ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px"><p style="margin:0;font-size:13px;color:#92400e"><strong>Customer note:</strong> ${opts.message}</p></div>` : ''}

${btn('Open in Admin', `${SITE_URL}/admin/quotes`)}`;

  const { error } = await resend().emails.send({
    from: FROM_NOREPLY,
    to: [ADMIN_EMAIL],
    subject: `🔔 New quote: ${opts.customerName} (${opts.referenceId})`,
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 3. Admin sends a price to the customer ────────────────────────────────────
export async function sendQuoteToCustomer(opts: {
  to: string;
  name: string;
  referenceId: string;
  quotedAmount: number;
  currency: string;
  adminMessage?: string;
  expiresAt?: string;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: opts.currency }).format(n);
  const portalUrl = `${SITE_URL}/portal`;

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Your Quote is Ready</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${opts.name.split(' ')[0]}, we've prepared a price for your enquiry ${refBadge(opts.referenceId)}.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px">
  <tr style="background:#0087C3">
    <td style="padding:20px 24px">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Quoted Amount</p>
      <p style="margin:6px 0 0;color:#ffffff;font-size:32px;font-weight:800;line-height:1">${fmt(opts.quotedAmount)}</p>
    </td>
  </tr>
  ${opts.expiresAt ? `<tr><td style="padding:12px 24px;background:#f8fafc;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0">
    ⏱ This quote is valid until <strong>${new Date(opts.expiresAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
  </td></tr>` : ''}
</table>

${opts.adminMessage ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#0369a1;line-height:1.6"><strong>Note from our team:</strong><br>${opts.adminMessage}</p></div>` : ''}

<p style="margin:0 0 4px;font-size:14px;color:#374151;font-weight:600">Ready to proceed?</p>
<p style="margin:0 0 16px;font-size:13px;color:#64748b">Log in to your customer portal to review and accept this quote. Once accepted, we'll create your order and get things moving.</p>

${btn('Accept this quote', portalUrl)}

<p style="margin:16px 0 0;font-size:12px;color:#94a3b8">If you have questions or would like to negotiate, simply reply to this email.</p>`;

  const { error } = await resend().emails.send({
    from: FROM_ORDERS,
    to: [opts.to],
    subject: `Your quote is ready — ${opts.referenceId}`,
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 4. Customer accepted quote → order created ────────────────────────────────
export async function sendQuoteAcceptedEmails(opts: {
  customerEmail: string;
  customerName: string;
  adminEmail?: string;
  referenceId: string;
  orderReferenceId: string;
  quotedAmount: number;
  currency: string;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: opts.currency }).format(n);

  // Customer email
  const customerBody = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Order Confirmed!</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${opts.customerName.split(' ')[0]}, you've accepted the quote ${refBadge(opts.referenceId)} and your order has been created.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px">
  <tr><td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#64748b;font-weight:600">Order reference</span><br><span style="font-family:monospace;font-weight:700;color:#0f172a;font-size:15px">${opts.orderReferenceId}</span></td></tr>
  <tr><td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#64748b;font-weight:600">Amount</span><br><span style="font-weight:800;color:#0087C3;font-size:17px">${fmt(opts.quotedAmount)}</span></td></tr>
  <tr><td style="padding:14px 20px;font-size:13px"><span style="color:#64748b;font-weight:600">Status</span><br><span style="color:#059669;font-weight:700">✓ Confirmed — being processed</span></td></tr>
</table>

<p style="margin:0 0 4px;font-size:13px;color:#475569">Track your order progress at any time from the portal or tracker:</p>
${btn('Track my order', `${SITE_URL}/track?ref=${opts.orderReferenceId}`)}
<p style="margin:0 0 0 0;font-size:12px;color:#94a3b8">Your account manager will be in touch with payment and shipping details shortly.</p>`;

  const r1 = await resend().emails.send({
    from: FROM_ORDERS,
    to: [opts.customerEmail],
    subject: `Order confirmed — ${opts.orderReferenceId}`,
    html: wrap(customerBody),
  });

  // Admin alert
  const adminBody = `
<h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a">Quote Accepted — Order Created</h1>
<p style="margin:0 0 20px;font-size:14px;color:#64748b">${opts.customerName} accepted ${refBadge(opts.referenceId)} and a new order has been auto-created.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:140px">Customer</td><td style="font-size:13px;font-weight:600;color:#0f172a">${opts.customerName}</td></tr>
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Order Ref</td><td>${refBadge(opts.orderReferenceId)}</td></tr>
  <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Amount</td><td style="font-size:14px;font-weight:700;color:#0087C3">${fmt(opts.quotedAmount)}</td></tr>
</table>

${btn('View order in Admin', `${SITE_URL}/admin/orders`)}`;

  const r2 = await resend().emails.send({
    from: FROM_NOREPLY,
    to: [opts.adminEmail ?? ADMIN_EMAIL],
    subject: `✅ Quote accepted — order ${opts.orderReferenceId} created`,
    html: wrap(adminBody),
  });

  return { ok: !r1.error && !r2.error };
}

// ── 5. Order status update ────────────────────────────────────────────────────
const STATUS_SUBJECT: Record<string, string> = {
  confirmed:  'Your order has been confirmed',
  processing: 'Your order is being processed',
  shipped:    'Your order has shipped!',
  delivered:  'Your order has been delivered',
  cancelled:  'Your order has been cancelled',
};
const STATUS_INTRO: Record<string, string> = {
  confirmed:  "We've confirmed your order and it's queued for processing.",
  processing: "Our team is actively preparing your order for dispatch.",
  shipped:    "Your order is on its way — expect delivery within your agreed timeframe.",
  delivered:  "Your order has been marked as delivered. We hope everything arrived perfectly.",
  cancelled:  "Your order has been cancelled. Please contact us if this was unexpected.",
};
const STATUS_EMOJI: Record<string, string> = {
  confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '📦', cancelled: '❌',
};

export async function sendOrderStatusEmail(opts: {
  to: string;
  customerName: string;
  referenceId: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber?: string;
  customNote?: string;
  items?: { productName: string; qty: number; unit: string; unitPrice: number }[];
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: opts.currency }).format(n);
  const subject = STATUS_SUBJECT[opts.status] ?? `Order update — ${opts.referenceId}`;
  const intro   = STATUS_INTRO[opts.status]   ?? 'Your order has been updated.';
  const emoji   = STATUS_EMOJI[opts.status]   ?? '📋';

  const itemRows = (opts.items ?? []).map(i =>
    `<tr>
       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151">${i.productName}</td>
       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center">${i.qty} ${i.unit}</td>
       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#374151;text-align:right">${fmt(i.unitPrice * i.qty)}</td>
     </tr>`
  ).join('');

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">${emoji} ${subject}</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Hi ${opts.customerName.split(' ')[0]}, ${intro}</p>

${opts.customNote ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#0369a1;line-height:1.6"><strong>Note from your account manager:</strong><br>${opts.customNote}</p></div>` : ''}

${opts.trackingNumber ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#166534"><strong>🚚 Tracking number:</strong> <span style="font-family:monospace;font-weight:700">${opts.trackingNumber}</span></p></div>` : ''}

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px">
  <tr style="background:#f8fafc">
    <td colspan="3" style="padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Order ${refBadge(opts.referenceId)}</td>
  </tr>
  ${itemRows ? `<tr style="background:#f8fafc">
    <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:left;border-bottom:1px solid #e2e8f0">Product</th>
    <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:center;border-bottom:1px solid #e2e8f0">Qty</th>
    <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#94a3b8;text-align:right;border-bottom:1px solid #e2e8f0">Line Total</th>
  </tr><tbody>${itemRows}</tbody>` : ''}
  <tr>
    <td colspan="2" style="padding:12px;font-weight:700;font-size:14px;color:#1e293b;text-align:right;border-top:1px solid #e2e8f0">Order Total</td>
    <td style="padding:12px;font-weight:800;font-size:15px;color:#0087C3;text-align:right;border-top:1px solid #e2e8f0">${fmt(opts.total)}</td>
  </tr>
</table>

${btn('Track this order', `${SITE_URL}/track?ref=${opts.referenceId}`)}
<p style="margin:8px 0 0;font-size:12px;color:#94a3b8">Questions? Reply to this email or call <strong>+1 (713) 555-0172</strong>.</p>`;

  const { error } = await resend().emails.send({
    from: FROM_ORDERS,
    to: [opts.to],
    subject,
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 6. Magic link — customer portal ──────────────────────────────────────────
export async function sendPortalMagicLink(opts: {
  to: string;
  token: string;
  ttlMinutes: number;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const link = `${SITE_URL}/portal/verify?token=${opts.token}`;

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Sign in to your portal</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Click the button below to access your orders and quotes. This link expires in <strong>${opts.ttlMinutes} minutes</strong> and can only be used once.</p>

${btn('Open my portal', link)}

<p style="margin:20px 0 0;font-size:12px;color:#94a3b8">If you didn't request this link, you can safely ignore this email. Your account is not at risk.</p>
<p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;word-break:break-all">${link}</p>`;

  const { error } = await resend().emails.send({
    from: FROM_NOREPLY,
    to: [opts.to],
    subject: 'Your Covestro PC portal sign-in link',
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 7. Magic link — distributor portal ───────────────────────────────────────
export async function sendDistributorMagicLink(opts: {
  to: string;
  token: string;
  ttlMinutes: number;
  companyName?: string;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const link = `${SITE_URL}/distributor/verify?token=${opts.token}`;

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Sign in to the Distributor Portal</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b">Hello${opts.companyName ? ` ${opts.companyName}` : ''}, click below to access your distributor dashboard, pricing and quote tools. This link expires in <strong>${opts.ttlMinutes} minutes</strong>.</p>

${btn('Open distributor portal', link)}

<p style="margin:20px 0 0;font-size:12px;color:#94a3b8">If you didn't request this link, you can safely ignore this email.</p>
<p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;word-break:break-all">${link}</p>`;

  const { error } = await resend().emails.send({
    from: FROM_NOREPLY,
    to: [opts.to],
    subject: 'Your Covestro PC distributor portal sign-in link',
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}

// ── 8. Distributor application emails (kept from original) ───────────────────
export async function sendDistributorApplicationEmails(opts: {
  to: string;
  fullName: string;
  companyName: string;
  phone: string;
  businessType: string;
  countries: string[];
  estimatedAnnualVolume: string;
  message?: string;
}) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };

  const confirmBody = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Application Received!</h1>
<p style="margin:0 0 20px;font-size:14px;color:#64748b">Hi ${opts.fullName}, we're excited about the possibility of partnering with <strong>${opts.companyName}</strong>.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px">
  <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em">What happens next</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${['Application review (24–48 hrs)', `Initial call to ${opts.phone}`, 'Agreement & onboarding'].map((s, i) =>
      `<tr><td style="padding:8px 0;font-size:13px;color:#374151;vertical-align:top">
        <span style="display:inline-block;width:22px;height:22px;background:#0087C3;color:#fff;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;margin-right:10px">${i + 1}</span>${s}
      </td></tr>`).join('')}
  </table>
</div>

${btn('Explore product catalog', `${SITE_URL}/products`)}`;

  const adminBody = `
<h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a">🔔 New Distributor Application</h1>
<p style="margin:0 0 20px;font-size:14px;color:#64748b">Action required: review and follow up within 24 hours.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
  ${[
    ['Name', opts.fullName], ['Company', opts.companyName], ['Email', opts.to],
    ['Phone', opts.phone], ['Business Type', opts.businessType],
    ['Territories', opts.countries.join(', ')], ['Est. Annual Volume', opts.estimatedAnnualVolume],
  ].map(([k, v]) => `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:160px">${k}</td><td style="font-size:13px;font-weight:600;color:#0f172a">${v}</td></tr>`).join('')}
</table>
${opts.message ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px"><p style="margin:0;font-size:13px;color:#92400e">${opts.message}</p></div>` : ''}
${btn('View in Admin', `${SITE_URL}/admin/distributors`)}`;

  const [r1, r2] = await Promise.all([
    resend().emails.send({ from: FROM_NOREPLY, to: [opts.to], subject: '✅ Your Covestro Distributor Application — What\'s Next?', html: wrap(confirmBody) }),
    resend().emails.send({ from: FROM_NOREPLY, to: [ADMIN_EMAIL], subject: `🚀 New Distributor Application: ${opts.companyName}`, html: wrap(adminBody) }),
  ]);
  return { ok: !r1.error && !r2.error };
}

// ── 9. Contact form confirmation ─────────────────────────────────────────────
export async function sendContactConfirmationEmail(email: string, name: string) {
  if (!RESEND_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };

  const body = `
<h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a">Message Received</h1>
<p style="margin:0 0 20px;font-size:14px;color:#64748b">Hi ${name}, thank you for reaching out. We've received your message and will reply within 24 business hours.</p>
<p style="margin:0 0 16px;font-size:13px;color:#475569">While you wait, feel free to explore our product catalog or technical resources.</p>
${btn('Browse products', `${SITE_URL}/products`)}`;

  const { error } = await resend().emails.send({
    from: FROM_NOREPLY,
    to: [email],
    subject: 'We received your message',
    html: wrap(body),
  });
  return { ok: !error, error: error?.message };
}
