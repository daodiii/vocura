import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions in production

  // Session replay (optional)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,

  // Don't send PII
  sendDefaultPii: false,

  // Filter out noisy errors
  ignoreErrors: [
    'AbortError',
    'ResizeObserver loop',
    'NetworkError',
    'Load failed',
  ],
});
