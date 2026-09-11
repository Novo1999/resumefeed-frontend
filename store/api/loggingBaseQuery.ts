import type { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** Logging is on in development only. Flip to `true` to debug a production build. */
const ENABLED = process.env.NODE_ENV !== 'production';

type FetchBaseQueryFn = ReturnType<typeof fetchBaseQuery>;

/** FormData doesn't survive `console.log` legibly, so flatten it first. */
function formatBody(body: unknown) {
  if (body instanceof FormData) {
    return Object.fromEntries(
      Array.from(body.entries(), ([key, value]) => [
        key,
        value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value,
      ]),
    );
  }
  return body;
}

/**
 * Wraps a base query so every request logs its endpoint, body and response
 * to the console as one collapsed group.
 */
export function withLogging(rawBaseQuery: FetchBaseQueryFn): FetchBaseQueryFn {
  return async (args, api, extraOptions) => {
    if (!ENABLED) return rawBaseQuery(args, api, extraOptions);

    const startedAt = performance.now();
    const result = await rawBaseQuery(args, api, extraOptions);
    const duration = Math.round(performance.now() - startedAt);

    const request = typeof args === 'string' ? { url: args } : args;
    const method = request.method ?? 'GET';
    const status = result.error ? result.error.status : (result.meta?.response?.status ?? 'done');
    const ok = !result.error;

    console.groupCollapsed(
      `%cRTK%c ${method} ${api.endpoint} %c${status}%c ${duration}ms`,
      'background:#764abc;color:#fff;padding:1px 4px;border-radius:3px;font-weight:bold',
      'color:inherit;font-weight:bold',
      `color:${ok ? '#16a34a' : '#dc2626'};font-weight:bold`,
      'color:#888;font-weight:normal',
    );
    console.log('url    ', result.meta?.request.url ?? request.url);
    if (typeof args !== 'string' && args.params) console.log('params ', args.params);
    if (typeof args !== 'string' && args.body !== undefined) {
      console.log('body   ', formatBody(args.body));
    }
    console.log(ok ? 'response' : 'error   ', ok ? result.data : result.error);
    console.groupEnd();

    return result;
  };
}
