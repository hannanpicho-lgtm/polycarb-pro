import { NextResponse, type NextRequest } from 'next/server';
import { computeAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth';
import { verifySessionCookie, PORTAL_COOKIE } from '@/lib/portal-auth';
import { verifyDistSessionCookie, DIST_COOKIE } from '@/lib/distributor-auth';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

const TRACKED_QUERY_TO_COOKIE: Array<{ query: string; cookie: string }> = [
  { query: 'utm_source', cookie: 'pc_utm_source' },
  { query: 'utm_medium', cookie: 'pc_utm_medium' },
  { query: 'utm_campaign', cookie: 'pc_utm_campaign' },
  { query: 'gclid', cookie: 'pc_gclid' },
  { query: 'msclkid', cookie: 'pc_msclkid' },
  { query: 'fbclid', cookie: 'pc_fbclid' },
  { query: 'landing_path', cookie: 'pc_landing_path' },
];

const LAST_TOUCH_LANDING_PATH_COOKIE = 'pc_landing_path';
const FIRST_TOUCH_LANDING_PATH_COOKIE = 'pc_ft_landing_path';
const LAST_TOUCH_REFERRER_HOST_COOKIE = 'pc_referrer_host';
const FIRST_TOUCH_REFERRER_HOST_COOKIE = 'pc_ft_referrer_host';

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  };
}

function firstTouchCookieName(lastTouchCookieName: string) {
  return `pc_ft_${lastTouchCookieName.replace(/^pc_/, '')}`;
}

function requestPath(request: NextRequest) {
  const search = request.nextUrl.search;
  return `${request.nextUrl.pathname}${search}`;
}

function externalReferrerHost(request: NextRequest) {
  const referer = request.headers.get('referer');
  if (!referer) {
    return undefined;
  }

  try {
    const refererUrl = new URL(referer);
    if (refererUrl.host === request.nextUrl.host) {
      return undefined;
    }

    return refererUrl.hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;

  // ── Admin auth guard (also covers /print/* document pages) ──────────────────
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/print');
  const isAdminApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/admin/export');
  const isAuthEndpoint = pathname === '/api/admin/auth';
  const isLoginPage = pathname === '/admin/login';

  if ((isAdminPage || isAdminApi) && !isAuthEndpoint && !isLoginPage) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionCookie = request.cookies.get(ADMIN_COOKIE)?.value;

    let isAuthed = false;
    if (adminPassword && sessionCookie) {
      const expectedToken = await computeAdminToken(adminPassword);
      isAuthed = sessionCookie === expectedToken;
    }

    if (!isAuthed) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  // ── End admin guard ─────────────────────────────────────────────────────────

  // ── Portal auth guard ───────────────────────────────────────────────────────
  const isPortalDashboard = pathname.startsWith('/portal/dashboard') || pathname.startsWith('/portal/orders');
  const isPortalApi = pathname.startsWith('/api/portal') && pathname !== '/api/portal/request-link' && pathname !== '/api/portal/verify';

  if (isPortalDashboard || isPortalApi) {
    const portalCookie = request.cookies.get(PORTAL_COOKIE)?.value;
    let portalAuthed = false;
    if (portalCookie) {
      const email = await verifySessionCookie(portalCookie);
      portalAuthed = !!email;
    }
    if (!portalAuthed) {
      if (isPortalApi) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }
  // ── End portal guard ────────────────────────────────────────────────────────

  // ── Distributor portal guard ────────────────────────────────────────────────
  const isDistDashboard = pathname.startsWith('/distributor/dashboard') ||
    pathname.startsWith('/distributor/catalog') || pathname.startsWith('/distributor/quotes');
  const isDistApi = pathname.startsWith('/api/distributor') &&
    pathname !== '/api/distributor/request-link' && pathname !== '/api/distributor/verify';

  if (isDistDashboard || isDistApi) {
    const distCookie = request.cookies.get(DIST_COOKIE)?.value;
    let distAuthed = false;
    if (distCookie) {
      const email = await verifyDistSessionCookie(distCookie);
      distAuthed = !!email;
    }
    if (!distAuthed) {
      if (isDistApi) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      return NextResponse.redirect(new URL('/distributor', request.url));
    }
  }
  // ── End distributor guard ───────────────────────────────────────────────────

  // Navbar/Footer are now handled by the (public) route group layout.
  // No custom headers needed.
  const response = NextResponse.next();
  const cookieOptions = buildCookieOptions();
  const nowIso = new Date().toISOString();
  const currentPath = requestPath(request);
  const referrerHost = externalReferrerHost(request);
  const hasLandingPathParam = Boolean(searchParams.get('landing_path')?.trim());

  let hasClickId = false;
  let hasTrackedAttribution = false;

  for (const entry of TRACKED_QUERY_TO_COOKIE) {
    const value = searchParams.get(entry.query)?.trim();
    if (!value) {
      continue;
    }

    hasTrackedAttribution = true;

    if (entry.query === 'gclid' || entry.query === 'msclkid' || entry.query === 'fbclid') {
      hasClickId = true;
    }

    response.cookies.set(entry.cookie, value, cookieOptions);

    const firstTouchCookie = firstTouchCookieName(entry.cookie);
    if (!request.cookies.get(firstTouchCookie)?.value) {
      response.cookies.set(firstTouchCookie, value, cookieOptions);
    }
  }

  // If tracked attribution lands without an explicit landing_path, persist the current page path.
  if ((hasClickId || hasTrackedAttribution) && !hasLandingPathParam) {
    hasTrackedAttribution = true;
    response.cookies.set(LAST_TOUCH_LANDING_PATH_COOKIE, currentPath, cookieOptions);
    if (!request.cookies.get(FIRST_TOUCH_LANDING_PATH_COOKIE)?.value) {
      response.cookies.set(FIRST_TOUCH_LANDING_PATH_COOKIE, currentPath, cookieOptions);
    }
  }

  // Seed a first-entry landing path so organic/direct visits retain useful context before conversion.
  if (!request.cookies.get(LAST_TOUCH_LANDING_PATH_COOKIE)?.value) {
    hasTrackedAttribution = true;
    response.cookies.set(LAST_TOUCH_LANDING_PATH_COOKIE, currentPath, cookieOptions);
    if (!request.cookies.get(FIRST_TOUCH_LANDING_PATH_COOKIE)?.value) {
      response.cookies.set(FIRST_TOUCH_LANDING_PATH_COOKIE, currentPath, cookieOptions);
    }
  }

  if (referrerHost) {
    hasTrackedAttribution = true;
    response.cookies.set(LAST_TOUCH_REFERRER_HOST_COOKIE, referrerHost, cookieOptions);
    if (!request.cookies.get(FIRST_TOUCH_REFERRER_HOST_COOKIE)?.value) {
      response.cookies.set(FIRST_TOUCH_REFERRER_HOST_COOKIE, referrerHost, cookieOptions);
    }
  }

  if (hasTrackedAttribution) {
    response.cookies.set('pc_attr_last_touch_at', nowIso, cookieOptions);
    if (!request.cookies.get('pc_attr_first_touch_at')?.value) {
      response.cookies.set('pc_attr_first_touch_at', nowIso, cookieOptions);
    }
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  // CSP Header - allows images/scripts/styles from self and CDNs
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.resend.com; frame-ancestors 'self';"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
