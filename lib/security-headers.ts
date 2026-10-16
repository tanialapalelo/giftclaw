// Response headers applied to every route via next.config.ts `headers()`.
//
// The CSP ships as Content-Security-Policy-Report-Only first: browsers log
// (and, when a Sentry DSN is configured, report) violations without blocking
// anything. Promote it to an enforcing Content-Security-Policy once a week of
// reports comes back clean.

// Turns a Sentry DSN (https://KEY@HOST/PROJECT_ID) into its CSP report
// endpoint, so violations land in Sentry next to the app's other errors.
// Returns null for a missing or malformed DSN; the policy still applies,
// violations just only show up in the browser console.
export function sentryCspReportUri(dsn: string | undefined): string | null {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!url.username || !projectId) return null;
    return `${url.origin}/api/${projectId}/security/?sentry_key=${url.username}`;
  } catch {
    return null;
  }
}

export function buildCsp({
  isDev,
  reportUri,
}: {
  isDev: boolean;
  reportUri: string | null;
}): string {
  const directives = [
    "default-src 'self'",
    // Next.js injects inline bootstrap scripts; dev mode also needs eval for
    // React's debugging tools and HMR.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    // next/font self-hosts the Google fonts, so no font origins are needed.
    "font-src 'self'",
    // Sentry ingest. Vercel Analytics and Speed Insights post to same-origin
    // /_vercel/* paths, which 'self' already covers.
    "connect-src 'self' https://*.sentry.io",
    // Sentry Session Replay compresses in a blob: worker.
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (reportUri) directives.push(`report-uri ${reportUri}`);
  return directives.join("; ");
}

export function securityHeaders({
  isDev,
  sentryDsn,
}: {
  isDev: boolean;
  sentryDsn: string | undefined;
}): { key: string; value: string }[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Share links are capability URLs; never leak them to third parties.
    { key: "Referrer-Policy", value: "no-referrer" },
    // Enforced today, while the CSP's frame-ancestors is only report-only.
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    {
      key: "Content-Security-Policy-Report-Only",
      value: buildCsp({ isDev, reportUri: sentryCspReportUri(sentryDsn) }),
    },
  ];
}
