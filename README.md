# Covestro PC — Premium Polycarbonate B2B Website

[![CI](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/ci.yml) [![Deploy](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/deploy.yml) [![CodeQL](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/hannanpicho-lgtm/polycarb-pro/actions/workflows/codeql.yml)

A production-ready, Next.js B2B website for a premium polycarbonate products distributor. Built with the latest 2026 web stack, designed around the Covestro Global Corporate Website visual language.

---

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Framework  | **Next.js 15** (App Router, RSC, Server Actions, PPR) |
| Language   | **TypeScript** (strict mode)                          |
| Styling    | **Tailwind CSS v3** with custom design system         |
| Components | **shadcn/ui** + Radix UI primitives                   |
| Animation  | **Framer Motion**                                     |
| Forms      | **React Hook Form** + **Zod** validation              |
| Metrics    | **Vercel Analytics** + **Speed Insights**             |
| Theme      | **next-themes** dark/light mode                       |

---

## Getting Started

### Prerequisites

- Node.js **20+** (LTS) and **npm 10+** (see `engines` in `package.json`; `npm install` will warn on mismatch). The repo also works with **pnpm 9+** for installs.

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

## Fast checks (no production build)

```bash
npm run check
```

Runs `tsc --noEmit` and `eslint .` — use before every commit (see Git hooks below for staged-only fixes). Node **20+** is required (see `engines` in `package.json` and `.nvmrc` for `nvm` / `fnm`).

**CI / pre-push parity (includes Prettier + tests):** `npm run check:all` runs `check` and `prettier --check .` (same as the GitHub Actions “check:all” step). **pre-push** also runs **`npm run test:ci`** (Vitest), matching the CI **test** job without running a production build.

**Formatting (Prettier):** `npm run format` rewrites files; `npm run format:check` matches CI (fails on drift). Use along with `check` before a PR. Config: `.prettierrc` (ESLint: `eslint-config-prettier` in `eslint.config.mjs`).

**Git hooks:** `npm install` runs `husky` (`prepare`); **pre-commit** runs **lint-staged** on staged files (`eslint --fix` then `prettier --write` for JS/TS; Prettier for JSON/Markdown/YAML/CSS). **pre-push** runs `npm run check:all` then `npm run test:ci` (not `verify` / `next build` / `cf:build` — those stay for CI and `readiness:report`). To skip: `git commit --no-verify` or `git push --no-verify`. GitHub Actions sets **`HUSKY=0`** so `npm ci` in CI does not re-run Husky in cloud runners; hooks are for local dev only.

## One-command pre-deploy

```bash
npm run verify
```

Runs `check:all` (same as `check` + `prettier --check`) then `next build`. Use `npm run lint:fix` for safe auto-fixes and `npm run format` to apply Prettier. ESLint config: `eslint.config.mjs` (`next/core-web-vitals` + `next/typescript` via `@eslint/eslintrc` / `FlatCompat`; **Vitest** recommended rules for `*.{test,spec}.{ts,tsx}` via `eslint-plugin-vitest`).

### Windows: batch + production readiness

From the repo root, `batch\` contains:

- `verify.cmd` — `npm run verify` with `HUSKY=0` (same as the pre-build gate)
- `audit-high.cmd` — `npm audit --audit-level=high`
- `go-readiness.cmd` — runs `scripts/go-readiness.mjs` (verify + `npm audit` JSON + file checks) and writes `reports/prod-go-readiness.json` (see `.gitignore`)
- `go-readiness-opennext.cmd` — same, but the build step is **`verify:opennext`** (OpenNext + Cloudflare adapter), matching the GitHub **`verify`** job’s **`cf:build`**

Cross-platform: **`npm run readiness:report`** (same as `go-readiness.cmd`) — runs **`verify` → `test:ci` → `npm audit` (JSON) +** file checks. For **full build parity** with GitHub (includes **`cf:build`**): **`npm run readiness:report:opennext`** or env **`READINESS_OPENNEXT=1`**, or Windows **`go-readiness-opennext.cmd`**. The JSON report includes **`checks.verify.mode`** (`next` | `opennext`), **`checks.verify.nodeHeap`** (how Node’s heap limit was set for **verify and `test:ci`**; same env), and **`checks.verify.detail`**.

**Out of memory during `tsc` / `next build` (e.g. `heap out of memory`, `bad_alloc`, exit 134):** On some Windows machines the verify step can exceed a small Node heap. The readiness script **sets `--max-old-space-size` (default 8192 MB) for the verify and `test:ci` child processes** and **strips any prior `--max-old-space-size=…` from `NODE_OPTIONS`** so a low inherited cap does not block this. To manage heap yourself, set **`READINESS_HEAP_OFF=1`**, or **raise** with **`READINESS_HEAP_MB=12288`** or **`READINESS_NODE_OPTIONS=--max-old-space-size=...`**. CI runners often have enough headroom; local shells sometimes inherit a small `max-old-space-size`.

**`npm audit` exit code 1 with only moderate/low findings:** `npm` returns a **non-zero exit** when _any_ advisory is present; the report’s **recommendation** still uses **high/critical** counts for risk. Do not treat exit 1 alone as a “failed security gate” without reading severities.

**Dependency `overrides` (plain language):** Your app doesn’t list every library directly. **npm** builds a **tree** (e.g. the email SDK **resend** pulls in **svix**, which used to pull an older **uuid**). A security fix landed in **newer `uuid`**, but **resend** hadn’t bumped that sub-dependency yet. The **`"overrides": { "uuid": "^14.0.0" }`** line in `package.json` tells npm: “**wherever the tree would install `uuid`, use 14.x instead**” — so you get the patched version without waiting on **resend** to release. After any override change, run **`npm install`** and recheck with **`npm audit`**.

`verify:opennext` runs `check:all` and `opennextjs-cloudflare build` (matches GitHub PR CI; slower than `verify`).

**Unit tests:** `npm test` (watch) and `npm run test:ci` (single run with **v8 coverage**, used in GitHub Actions and pre-push). Tests live as `**/*.test.ts` next to sources (e.g. `lib/*.test.ts`). Coverage is **not** gated on a minimum percent yet; output is scoped to files executed by tests (see `vitest.config.ts`). The `coverage/` directory is gitignored.

**Reading the v8 “% Coverage” table (text reporter):** Vitest colors the table for quick scanning: **higher** statement/line coverage usually appears **green**; **low** or **partial** can show as **yellow** or **red** depending on your terminal theme—**red** means “a lot of this file’s lines were never run by a test,” not a failing test. The columns mean: **% Stmts** = fraction of _statements_ executed; **% Branch** = `if/else` (and similar) paths taken; **% Funcs** = functions called; **% Lines** = physical lines hit. The **“Uncovered Line #s”** column lists ranges (e.g. `42-77`) that no test hit—those are the priority if you want to add tests. A file can be **100%** on one row and still show numbers under **Branch** if some `if` branches are never taken (see **Branch** %).

**App Router API errors:** `lib/api-json-error.ts` exports **`apiJsonError(message, status, extra?)`**, which returns JSON shaped as **`{ error: string }`** (optional `extra` merges in fields such as `detail` on 502 from upstream email). All **`app/api/**/route.ts`\*\* error responses use it so the body shape stays consistent for clients and tests.

### Pre-launch & readiness (org checklist)

1. **Secrets & env:** Copy **`.env.example`**, set production values in **Cloudflare** (or your host) — never commit secrets. Strong **`ADMIN_PASSWORD`** / **`PORTAL_SECRET`**, **`RESEND_API_KEY`**, **Stripe** keys when using payments, and optional **CRM** webhook. D1 is configured via **`wrangler.jsonc`**, not a `.env` URL.
2. **Same gates as CI:** For a full release, run **`npm run readiness:report:opennext`** (or **`readiness:report`** for a faster gate that still runs **`next build`**, not OpenNext). Both write **`reports/prod-go-readiness.json`** with a **`recommendation`**. Triage **high/critical** `npm audit` items; moderate findings often land in **Dependabot** — document acceptance or upgrade paths.
3. **After deploy:** **`deploy.yml`** and the scheduled **Production health** workflow probe **`/api/health`** (liveness) and **`/api/version`** (build metadata). For deep flows (checkout, email content), add **manual** or org-owned **E2E**; this repo does not run browser tests in GitHub.
4. **Not automated here:** SLO/alerting beyond these GETs, legal/compliance sign-off, backup/DR, on-call runbooks — add those in your org’s launch process.

**Optional public contact strings** (no code change): set `NEXT_PUBLIC_CONTACT_SALES_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE_DISPLAY`, and `NEXT_PUBLIC_CONTACT_PHONE_HREF` in your Cloudflare/CI env. Defaults live in `lib/site-config.ts`. After changing the main phone, update `siteConfig.social.whatsapp` (`wa.me/…`) to match the same E.164 number.

## Production Verification (Commit -> Live)

This project now exposes build metadata and liveness in three places:

- Footer build stamp: `v<version> · <commit> · <build time>`
- API build info: **`/api/version`** (version, commit, builtAt)
- API liveness: **`/api/health`** (`{ ok: true, status: 'ok' }` — no secrets; for load balancers)

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

The composite action **`.github/actions/setup-node-project`** centralizes **checkout**, **Node** (via **`node-version-file: .nvmrc`** in `actions/setup-node`), **npm cache**, and **`npm ci`** (with **`HUSKY=0`** on install) for **CI**, **CodeQL**, and **deploy**. Change the Node major in **`.nvmrc`** (and keep **`package.json` `engines`** aligned) to move the whole pipeline. (`actions/checkout` already defaults to a shallow clone suitable for this repo.)

Key workflows under `.github/workflows/`:

- `ci.yml` — **three jobs** on pull requests and feature branches: (1) **`verify`** — `npm run check:all` then `npm run cf:build`. Both steps use **`NODE_OPTIONS=--max-old-space-size=8192`** (TypeScript and OpenNext/Next are memory-heavy, matching local `readiness:report` defaults). Same path as `deploy` before Wrangler — OpenNext runs the production build inside `cf:build`, with `.next/cache` restored from prior runs. **Local parity:** `npm run verify:opennext` (CI-equivalent) vs `npm run verify` (plain `next build`, a bit faster for day-to-day). (2) **`test`** (parallel) — `npm run test:ci` (Vitest with v8 coverage; `scripts/write-vitest-coverage-summary.mjs` appends totals to the job **Summary**). (3) **`audit`** (parallel) — writes `npm audit` counts to the Actions **job summary**, then runs `npm audit --audit-level=high` (same strictness as `batch/audit-high.cmd`; moderate-only advisories do not fail this job). All use `permissions: { contents: read }`.
- `deploy.yml` — runs on every push to `main` (and can be triggered manually from the Actions tab). Same `check:all` (8 GB Node heap) + `cf:build` (8 GB), then Wrangler deploy, and smoke-tests `/api/version`. The OpenNext/Next build step reuses the same **`.next/cache`** strategy as PR CI to speed up production builds when inputs match a previous cache entry.
- `health-prod.yml` — **systems / reliability:** on a **schedule** (every 4 hours UTC) and on **workflow_dispatch**, `curl` the public **`https://covestroppc.com/api/version`** and require JSON `ok: true` (no secrets). Catches long-lived outages or misconfiguration between deploys. GitHub only runs `schedule` on the **default branch**; [enable failure notifications](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/notifications-for-workflow-runs) if you want emails on red runs.
- `codeql.yml` — **[CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)** for **JavaScript/TypeScript** using **`build-mode: none`** (no `next build` / no `autobuild` — the right mode for interpreted JS/TS). Runs on pushes and PRs to `main`, plus a **weekly** schedule. Results go to **Security → Code scanning** (`security-events: write`). Complements Dependabot and `npm audit`; fork PRs may have [limited SARIF upload](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/using-code-scanning-with-a-repository-fork) unless the repo allows it.

[Dependabot](https://docs.github.com/en/code-security/dependabot) is enabled via `.github/dependabot.yml`: **npm** updates weekly, **GitHub Actions** (workflow action pins) monthly. Add the labels `dependencies`, `npm`, and `ci` in the repo (or let Dependabot create them on first run).

### One-time setup

Add these **repository secrets** in `Settings → Secrets and variables → Actions`:

| Name                    | Value                                                                                                        | Where to get it                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with **Workers Scripts: Edit**, **Account Settings: Read**, **Zone: Read**, **User Details: Read** | [Cloudflare → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens) → _Create Token_ → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID                                                                                              | Cloudflare dashboard → right sidebar on any zone overview                                                                                      |

Optional **repository variable** (not a secret):

| Name                   | Example                   |
| ---------------------- | ------------------------- |
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

| Route              | Description                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `/`                | Homepage: hero, filter, featured products, applications, why PC, brands, testimonials, blog |
| `/products`        | Filterable product catalogue (by material type + industry)                                  |
| `/products/[slug]` | Dynamic product detail page with specs, actions, JSON-LD                                    |
| `/applications`    | Industry overview cards                                                                     |
| `/about`           | Company story, stats, values                                                                |
| `/contact`         | Contact form (Server Action validated)                                                      |

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

| Key                                     | Required | Description                                                                 |
| --------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`                        | Yes      | Resend API key used to send lead emails                                     |
| `RESEND_FROM_EMAIL`                     | Optional | Sender address (defaults to `no-reply@<site-hostname>`)                     |
| `RESEND_TO_EMAIL`                       | Optional | Recipient address for inbound leads                                         |
| `RESEND_TO_EMAIL_SALES`                 | Optional | Primary recipient for sales-routed leads                                    |
| `RESEND_TO_EMAIL_TECHNICAL_SALES`       | Optional | Primary recipient for technical-sales-routed leads                          |
| `RESEND_TO_EMAIL_MARKETING`             | Optional | Primary recipient for marketing-routed leads                                |
| `RESEND_TO_EMAIL_HIGH_PRIORITY`         | Optional | Additional recipient for high-priority lead escalation                      |
| `RESEND_TO_EMAIL_ESCALATION`            | Optional | Fallback escalation recipient for high-priority leads                       |
| `CRM_WEBHOOK_URL`                       | Optional | Endpoint to forward lead payloads to your CRM                               |
| `CRM_WEBHOOK_BEARER_TOKEN`              | Optional | Bearer token for webhook authentication                                     |
| `CRM_WEBHOOK_FAILOVER_URL`              | Optional | Secondary endpoint used if primary webhook delivery keeps failing           |
| `CRM_WEBHOOK_RETRIES`                   | Optional | Retry count per endpoint for webhook delivery (default: `2`, max: `5`)      |
| `CRM_WEBHOOK_RETRY_BACKOFF_MS`          | Optional | Base backoff in milliseconds between retries (default: `400`)               |
| `CRM_WEBHOOK_SIGNING_SECRET`            | Optional | Shared secret used to sign webhook requests with HMAC SHA-256               |
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

| Key                                     | Value                                                      |
| --------------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                  | `https://yourdomain.com`                                   |
| `RESEND_API_KEY`                        | `re_...`                                                   |
| `RESEND_FROM_EMAIL`                     | `Leads <no-reply@yourdomain.com>`                          |
| `RESEND_TO_EMAIL`                       | `sales@yourdomain.com`                                     |
| `CRM_WEBHOOK_URL`                       | `https://your-crm-endpoint.example.com/leads` (optional)   |
| `CRM_WEBHOOK_BEARER_TOKEN`              | `your_token_here` (optional)                               |
| `CRM_WEBHOOK_FAILOVER_URL`              | `https://backup-crm-endpoint.example.com/leads` (optional) |
| `CRM_WEBHOOK_RETRIES`                   | `2` (optional)                                             |
| `CRM_WEBHOOK_RETRY_BACKOFF_MS`          | `400` (optional)                                           |
| `CRM_WEBHOOK_SIGNING_SECRET`            | `super-secret-shared-key` (optional)                       |
| `CRM_WEBHOOK_SIGNATURE_MAX_AGE_SECONDS` | `300` (optional)                                           |

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
