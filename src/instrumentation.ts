export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        urlQueryParams: false,
        httpBodies: [],
        databaseQueryData: false,
        stackFrameVariables: false,
      },
      tracesSampleRate: 0.05,
      beforeSend(event) {
        delete event.user;
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });
  }
}
export const onRequestError = async (
  ...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>
) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureRequestError(...args);
  }
};
