/** @type {import('next').NextConfig} */

// Content-Security-Policy. Kept compatible with Next (inline bootstrap + styled-jsx),
// next/font (self-hosted), Unsplash imagery, and dev HMR (ws/eval). Tighten script-src
// with nonces in a later pass if desired.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://*.razorpay.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.razorpay.com${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
