import {
  buildCsp,
  securityHeaders,
  sentryCspReportUri,
} from "@/lib/security-headers";
import { metadata as friendsMetadata } from "@/app/friends/layout";

describe("sentryCspReportUri", () => {
  it("builds the Sentry security endpoint from a DSN", () => {
    expect(
      sentryCspReportUri("https://abc123@o42.ingest.us.sentry.io/4507")
    ).toBe(
      "https://o42.ingest.us.sentry.io/api/4507/security/?sentry_key=abc123"
    );
  });

  it.each([
    undefined,
    "",
    "https://.......",
    "not a url",
    "https://o1.ingest.sentry.io/1",
  ])("returns null for unusable DSN %j", (dsn) => {
    expect(sentryCspReportUri(dsn)).toBeNull();
  });
});

describe("buildCsp", () => {
  it("allows self, Sentry ingest, and blocks framing", () => {
    const csp = buildCsp({ isDev: false, reportUri: null });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self' https://*.sentry.io");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("report-uri");
  });

  it("allows eval only in dev", () => {
    expect(buildCsp({ isDev: true, reportUri: null })).toContain(
      "'unsafe-eval'"
    );
  });

  it("appends report-uri when given", () => {
    expect(
      buildCsp({ isDev: false, reportUri: "https://r.example/x" })
    ).toMatch(/; report-uri https:\/\/r\.example\/x$/);
  });
});

describe("securityHeaders", () => {
  it("ships the CSP as report-only alongside the baseline headers", () => {
    const headers = Object.fromEntries(
      securityHeaders({ isDev: false, sentryDsn: undefined }).map((h) => [
        h.key,
        h.value,
      ])
    );
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Content-Security-Policy-Report-Only"]).toBeDefined();
    expect(headers["Content-Security-Policy"]).toBeUndefined();
  });
});

describe("friends layout metadata", () => {
  it("opts every /friends/* page out of indexing", () => {
    expect(friendsMetadata.robots).toEqual({ index: false, follow: false });
  });
});
