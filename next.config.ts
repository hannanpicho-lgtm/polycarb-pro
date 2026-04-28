import type { NextConfig } from 'next';

const resolvedGitSha =
  process.env.NEXT_PUBLIC_GIT_SHA ??
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.GIT_COMMIT_SHA ??
  'local';

const resolvedBuildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString();

const nextConfig: NextConfig = {
  // Bake build metadata into the app so /api/version can identify deployed revision.
  env: {
    NEXT_PUBLIC_BUILD_TIME: resolvedBuildTime,
    NEXT_PUBLIC_GIT_SHA: resolvedGitSha,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      // Security headers for all routes — no cache-control here (each route decides its own TTL)
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },

      // Immutable cache ONLY for Next.js hashed static chunks — these filenames change on every build
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },

      // Public image/media assets (non-hashed) — moderate TTL
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },

      // Admin, portal, distributor — never cache, always fresh
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/portal/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
      {
        source: '/distributor/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },

      // API routes — never cache
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
