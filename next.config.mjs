/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false, // Disabling to prevent Turbopack panic
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Removed X-Forwarded-Proto: https to allow local network testing
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://checkout.razorpay.com https://sdk.cashfree.com https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://*.supabase.co https://img.icons8.com https://images.pexels.com https://images.unsplash.com https://encrypted-tbn0.gstatic.com https://encrypted-tbn1.gstatic.com https://encrypted-tbn2.gstatic.com https://encrypted-tbn3.gstatic.com https://m.media-amazon.com https://*.razorpay.com https://img.youtube.com https://imagizer.imageshack.com https://imageshack.com https://maps.gstatic.com https://*.googleapis.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://www.googletagmanager.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net https://*.razorpay.com https://*.cashfree.com https://*.google.com https://*.googleapis.com https://www.goldapi.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://www.merchant-center-analytics.goog https://secure.ccavenue.com",
              "media-src 'self' blob: data: https://*.supabase.co",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.razorpay.com https://sdk.cashfree.com https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com https://vercel.com https://secure.ccavenue.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self' https://secure.ccavenue.com"
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
      {
        source: '/(fonts|images|icons)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  images: {
    qualities: [75, 85],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480, 576],
    localPatterns: [
      {
        pathname: '/api/proxy',
        search: '?url=**',
      },
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'imagizer.imageshack.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'imageshack.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'web.telegram.org',
        pathname: '**',
      }
    ],
  },
  turbopack: {},
}

const withPWA = (await import("@ducanh2912/next-pwa")).default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ["/sw-push.js"],
  },
});

export default process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig);
