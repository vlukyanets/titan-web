/**
 * The response headers a TITAN node sends with the UI (titan ADR 0012).
 * `vite preview` sends the same ones so the end-to-end tests exercise the
 * production build under the node's real Content-Security-Policy. HSTS is
 * left out because the preview server speaks plain HTTP.
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "require-trusted-types-for 'script'",
].join('; ');

export const securityHeaders: Readonly<Record<string, string>> = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};
