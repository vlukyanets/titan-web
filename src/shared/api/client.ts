import createClient, { type Client, type ClientOptions, type Middleware } from 'openapi-fetch';
import type { Connection } from './connection.ts';
import type { paths } from './schema.gen.ts';

export type ApiClient = Client<paths>;

/**
 * The node refuses cookie-authenticated writes without this header, which a
 * cross-site form cannot set (titan ADR 0012). It is sent on every request.
 */
export const requestHeader = { name: 'X-Titan-Request', value: '1' } as const;

const gatewayStatuses = new Set([502, 503, 504]);

/**
 * Whether a response came from a TITAN node. Gateway errors without a TITAN
 * problem body come from whatever stands in front of the node (Tailscale),
 * so they mean the node was not reached.
 */
export function isNodeAnswer(response: Response): boolean {
  if (!gatewayStatuses.has(response.status)) {
    return true;
  }
  const type = response.headers.get('Content-Type') ?? '';
  return type.startsWith('application/problem+json');
}

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export function connectionMiddleware(connection: Connection): Middleware {
  return {
    onRequest({ request }) {
      request.headers.set(requestHeader.name, requestHeader.value);
      return request;
    },
    onResponse({ response }) {
      if (isNodeAnswer(response)) {
        connection.reportSuccess();
      } else {
        connection.reportFailure();
      }
      return undefined;
    },
    onError({ error }) {
      // A cancelled request (a query that is no longer needed) says nothing
      // about the node.
      if (!isAbort(error)) {
        connection.reportFailure();
      }
      return undefined;
    },
  };
}

interface ApiClientOptions {
  connection: Connection;
  fetch?: ClientOptions['fetch'];
}

/**
 * The typed client for the node's API. Paths already start with `/api/v1`,
 * and requests go to the page's own origin with its session cookie; the
 * origin is spelled out because `Request` outside a browser page does not
 * resolve relative URLs.
 */
export function createApiClient({ connection, fetch }: ApiClientOptions): ApiClient {
  const client = createClient<paths>({
    baseUrl: globalThis.location.origin,
    credentials: 'same-origin',
    ...(fetch === undefined ? {} : { fetch }),
  });
  client.use(connectionMiddleware(connection));
  return client;
}
