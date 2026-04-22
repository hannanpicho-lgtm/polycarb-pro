# Covestro PC — Premium Polycarbonate B2B Website

A production-ready, Next.js B2B website for a premium polycarbonate products distributor. Built with the latest 2026 web stack, designed around the Covestro Global Corporate Website visual language.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router, RSC, Server Actions, PPR) |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS v3** with custom design system |
| Components | **shadcn/ui** + Radix UI primitives |
| Animation | **Framer Motion** |
| Forms | **React Hook Form** + **Zod** validation |
| Metrics | **Vercel Analytics** + **Speed Insights** |
| Theme | **next-themes** dark/light mode |

---

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+ or pnpm 9+

### Installation

```bash
# Clone / open the project
cd polycarb-pro

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## VS Code to Cursor Migration (Seamless Setup)

This repo includes shared editor config so VS Code and Cursor behave the same:

- `.editorconfig` enforces indentation, line endings, and trailing-newline rules.
- `.vscode/settings.json` enables format-on-save, ESLint fixes on save, and workspace TypeScript.
- `.vscode/extensions.json` recommends key extensions for linting/formatting/Tailwind.

Recommended first run after migration:

```bash
npm install
npm run type-check
npm run lint
```

---

## Production Verification (Commit -> Live)

This project now exposes build metadata in two places:

- Footer build stamp: `v<version> · <commit> · <build time>`
- API endpoint: `/api/version`

To deploy with tracked metadata:

```bash
npm run cf:deploy:tracked
```

This script injects:

- `NEXT_PUBLIC_GIT_SHA`
- `NEXT_PUBLIC_BUILD_TIME`

How to confirm production is updated:

1. Deploy with `npm run cf:deploy:tracked`
2. Open `https://www.covestroppc.com/api/version`
3. Confirm `commit` and `builtAt` match your latest deployment
4. Hard refresh the site and verify the footer build stamp matches

---

## Continuous Deployment (GitHub Actions → Cloudflare)

Two workflows are wired up under `.github/workflows/`:

- `ci.yml` — runs on pull requests and feature branches. Executes `type-check` and `lint`.
- `deploy.yml` — runs on every push to `main` (and can be triggered manually from the Actions tab). It type-checks, builds the OpenNext worker, deploys with Wrangler, and smoke-tests `/api/version`.

### One-time setup

Add these **repository secrets** in `Settings → Secrets and variables → Actions`:

| Name | Value | Where to get it |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token with **Workers Scripts: Edit**, **Account Settings: Read**, **Zone: Read**, **User Details: Read** | [Cloudflare → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens) → _Create Token_ → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID | Cloudflare dashboard → right sidebar on any zone overview |

Optional **repository variable** (not a secret):

| Name | Example |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://covestroppc.com` |

### Protect the production environment (recommended)

In `Settings → Environments → production`:

- Require reviewers for manual approval before deploy
- Restrict deployments to the `main` branch

This prevents accidental auto-deploys while still giving you one-click promotion from the Actions tab.

### What happens on each push to `main`

1. Checkout + `npm ci`
2. `npm run type-check`
3. `npm run cf:build` with `NEXT_PUBLIC_GIT_SHA` = `github.sha` and `NEXT_PUBLIC_BUILD_TIME` = commit timestamp
4. `wrangler deploy`
5. `curl https://covestroppc.com/api/version` and assert `"ok":true`
6. Summary written to the Actions run with the live version payload

After merging to `main`, open the **Actions** tab — you'll see the deploy progress. The summary at the bottom shows the deployed commit hash for auditability.

### Manual deploy from GitHub

Actions tab → **Deploy to Cloudflare** → _Run workflow_ → pick `main`.

### Local deploy (still supported)

The manual path remains available for hotfixes from your workstation:

```bash
npm run cf:deploy:tracked
```

---

## Project Structure

```
polycarb-pro/
├── app/
│   ├── layout.tsx               # Root layout: Navbar, Footer, ThemeProvider
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Tailwind base + CSS variables
│   ├── sitemap.ts               # Auto-generated sitemap
│   ├── robots.ts                # robots.txt
│   ├── not-found.tsx            # 404 page
│   ├── global-error.tsx         # Global error boundary
│   ├── products/
│   │   ├── page.tsx             # Product catalog with filters
│   │   ├── loading.tsx          # Skeleton UI
│   │   ├── error.tsx            # Error boundary
│   │   └── [slug]/
│   │       ├── page.tsx         # Dynamic product detail page
│   │       └── loading.tsx
│   ├── applications/
│   │   └── page.tsx             # Industries we serve
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       ├── page.tsx             # Inquiry form (Server Actions)
│       └── loading.tsx
│
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── navbar.tsx               # Responsive nav + mega dropdown
│   ├── footer.tsx               # Multi-column dark footer + newsletter
│   ├── hero.tsx                 # Auto-advancing hero carousel
│   ├── particle-dots.tsx        # SVG dot animation (Covestro-style)
│   ├── featured-products.tsx    # Homepage product grid
│   ├── applications-grid.tsx    # Industry cards
│   ├── why-polycarbonate.tsx    # Benefits + spec table
│   ├── brands-grid.tsx          # Brand logos + detail cards
│   ├── testimonials.tsx         # Customer quotes carousel
│   ├── blog-teaser.tsx          # Blog/resources horizontal scroll
│   ├── filter-section.tsx       # Homepage quick filter
│   ├── product-filters.tsx      # Products page search + filter
│   ├── newsletter-form.tsx      # Footer newsletter (Server Action)
│   ├── contact-form.tsx         # Contact page form (Server Action)
│   └── json-ld.tsx              # Organization structured data
│
├── lib/
│   ├── data.ts                  # All static product / brand / blog data
│   ├── actions.ts               # Server Actions (forms)
│   ├── schema.ts                # Zod validation schemas
│   └── utils.ts                 # cn(), formatPrice(), slugify()
│
├── public/                      # Static assets (add real images/logos here)
├── .env.example                 # Required environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage: hero, filter, featured products, applications, why PC, brands, testimonials, blog |
| `/products` | Filterable product catalogue (by material type + industry) |
| `/products/[slug]` | Dynamic product detail page with specs, actions, JSON-LD |
| `/applications` | Industry overview cards |
| `/about` | Company story, stats, values |
| `/contact` | Contact form (Server Action validated) |

---

## Customization

### 1. Company Name
Search and replace `Covestro PC` throughout the codebase with your brand name.

### 2. Product Data
Edit `lib/data.ts` — every product, application, brand, testimonial and blog post is defined here with full TypeScript types. Replace placeholder content with real data.

### 3. Colors
The brand blue is `#0087C3`. To change it, update `tailwind.config.ts` under `theme.extend.colors.brand` and the CSS variable `--primary` in `app/globals.css`.

### 4. Images
Replace Unsplash placeholder URLs in `lib/data.ts` and the Hero component with your own images. Add logo SVGs to `public/logos/`.

### 5. Email Integration
Email and lead forwarding are already implemented in `lib/lead-delivery.ts` and used by the Server Actions in `lib/actions.ts`.

Configure these environment variables:

| Key | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key used to send lead emails |
| `RESEND_FROM_EMAIL` | Optional | Sender address (defaults to `no-reply@<site-hostname>`) |
| `RESEND_TO_EMAIL` | Optional | Recipient address for inbound leads |
| `RESEND_TO_EMAIL_SALES` | Optional | Primary recipient for sales-routed leads |
| `RESEND_TO_EMAIL_TECHNICAL_SALES` | Optional | Primary recipient for technical-sales-routed leads |
| `RESEND_TO_EMAIL_MARKETING` | Optional | Primary recipient for marketing-routed leads |
| `RESEND_TO_EMAIL_HIGH_PRIORITY` | Optional | Additional recipient for high-priority lead escalation |
| `RESEND_TO_EMAIL_ESCALATION` | Optional | Fallback escalation recipient for high-priority leads |
| `CRM_WEBHOOK_URL` | Optional | Endpoint to forward lead payloads to your CRM |
| `CRM_WEBHOOK_BEARER_TOKEN` | Optional | Bearer token for webhook authentication |
| `CRM_WEBHOOK_FAILOVER_URL` | Optional | Secondary endpoint used if primary webhook delivery keeps failing |
| `CRM_WEBHOOK_RETRIES` | Optional | Retry count per endpoint for webhook delivery (default: `2`, max: `5`) |
| `CRM_WEBHOOK_RETRY_BACKOFF_MS` | Optional | Base backoff in milliseconds between retries (default: `400`) |
| `CRM_WEBHOOK_SIGNING_SECRET` | Optional | Shared secret used to sign webhook requests with HMAC SHA-256 |
| `CRM_WEBHOOK_SIGNATURE_MAX_AGE_SECONDS` | Optional | Receiver replay-window hint in seconds for signed webhooks (default: `300`) |

If `CRM_WEBHOOK_URL` is not set, webhook forwarding is skipped.

Webhook delivery now retries transient failures on the primary endpoint and can automatically attempt a secondary failover endpoint when configured.
Retry behavior is status-aware:
- Retries: network errors, timeouts, HTTP `429`, and HTTP `5xx`
- No retry: non-rate-limit HTTP `4xx` responses (fails fast)
Webhook requests include stable dedupe/correlation headers across retries and failover attempts:
- `Idempotency-Key` (derived from submission ID)
- `X-Lead-Submission-Id`
- `X-Lead-Retry-Attempt`
When `CRM_WEBHOOK_SIGNING_SECRET` is configured, requests also include verification headers:
- `X-Lead-Signature: v1=<hex-hmac-sha256(timestamp.body)>`
- `X-Lead-Signature-Timestamp`
- `X-Lead-Signature-Version: v1`
- `X-Lead-Signature-Max-Age-Seconds` (recommended receiver skew/replay window)

Lead emails can now be routed by derived team metadata. If the team-specific recipient variables are not set, delivery falls back to `RESEND_TO_EMAIL`.

Webhook payloads are sent with both the original flat `payload` object and additive structured blocks for easier CRM mapping:

```json
{
	"kind": "quote",
	"source": "Covestro PC",
	"submittedAt": "2026-04-16T00:00:00.000Z",
	"submission": {
		"id": "quote-...",
		"kind": "quote",
		"submittedAt": "2026-04-16T00:00:00.000Z",
		"ip": "...",
		"referer": "...",
		"userAgent": "..."
	},
	"attribution": {
		"leadSource": "product-detail-cta",
		"channel": "organic",
		"firstTouchChannel": "direct",
		"utmSource": "google",
		"landingPath": "/products/...",
		"referrerHost": "www.google.com",
		"daysToConversion": 2.125,
		"summary": "..."
	},
	"qualification": {
		"score": 78,
		"priority": "high",
		"intent": "quote-ready"
	},
	"routing": {
		"team": "sales",
		"queue": "sales-priority",
		"slaHours": 2
	},
	"payload": {
		"...": "existing flat lead fields remain unchanged"
	}
}
```

The flat `payload` also includes `leadScore`, `leadPriority`, `leadIntent`, `leadRoutingTeam`, `leadRoutingQueue`, and `leadSlaHours` so existing CRM mappings can adopt routing and qualification fields incrementally.

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (production)
vercel --prod
```

Set environment variables in the Vercel dashboard (Project → Settings → Environment Variables):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `RESEND_API_KEY` | `re_...` |
| `RESEND_FROM_EMAIL` | `Leads <no-reply@yourdomain.com>` |
| `RESEND_TO_EMAIL` | `sales@yourdomain.com` |
| `CRM_WEBHOOK_URL` | `https://your-crm-endpoint.example.com/leads` (optional) |
| `CRM_WEBHOOK_BEARER_TOKEN` | `your_token_here` (optional) |
| `CRM_WEBHOOK_FAILOVER_URL` | `https://backup-crm-endpoint.example.com/leads` (optional) |
| `CRM_WEBHOOK_RETRIES` | `2` (optional) |
| `CRM_WEBHOOK_RETRY_BACKOFF_MS` | `400` (optional) |
| `CRM_WEBHOOK_SIGNING_SECRET` | `super-secret-shared-key` (optional) |
| `CRM_WEBHOOK_SIGNATURE_MAX_AGE_SECONDS` | `300` (optional) |

Note: webhook backoff includes small jitter to reduce synchronized retry spikes.

Vercel Analytics and Speed Insights are already integrated — they activate automatically in production.

---

## Performance Features

- **Partial Prerendering (PPR)** — homepage static shell with dynamic islands
- **Static params** — product detail pages pre-built at deploy time via `generateStaticParams`
- **Next.js Image** — automatic WebP, responsive sizes, lazy loading on all images
- **Font optimization** — Inter loaded via `next/font/google` with `display: swap`
- **Edge-ready** — no Node.js-specific APIs in RSC trees
- **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy set globally

---

## Accessibility

- Skip-to-content link in root layout
- All interactive elements have `aria-label`
- Focus-visible ring styles on all focusable elements
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Colour contrast designed to WCAG 2.2 AA

---

## License

Private commercial use. Replace with your own licence before distribution.
