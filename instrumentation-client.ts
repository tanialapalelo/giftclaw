// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Inlined at build time. Without it the SDK stays disabled instead of
  // logging "Invalid Sentry Dsn".
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only report from production builds so local dev noise stays out of Sentry.
  enabled: process.env.NODE_ENV === "production",

  integrations: [
    Sentry.replayIntegration({
      // Friend names and notes are personal data; never record them.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Session replay sampling is left to decision D5.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
