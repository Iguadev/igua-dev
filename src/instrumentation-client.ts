if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import('@sentry/nextjs').then((Sentry) =>
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
      integrations: [],
      beforeSend(event) {
        delete event.user;
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
          delete event.request.headers;
        }
        event.breadcrumbs = event.breadcrumbs?.filter((b) => b.category !== 'ui.input');
        return event;
      },
    }),
  );
}
export const onRouterTransitionStart: typeof import('@sentry/nextjs').captureRouterTransitionStart =
  (...args) => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN)
      void import('@sentry/nextjs').then((Sentry) => Sentry.captureRouterTransitionStart(...args));
  };
