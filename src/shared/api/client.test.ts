import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient, isNodeAnswer } from './client.ts';
import { createConnection, type Connection } from './connection.ts';

const json = (body: unknown, status = 200, type = 'application/json') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': type } });

describe('createApiClient', () => {
  let connection: Connection | undefined;

  afterEach(() => {
    connection?.dispose();
  });

  const make = (fetch: (request: Request) => Promise<Response>) => {
    connection = createConnection({ healthUrl: '/api/v1/health', fetch: vi.fn() });
    const fetchMock = vi.fn(fetch);
    const client = createApiClient({ connection, fetch: fetchMock });
    return { client, connection, fetchMock };
  };

  it('calls the node on the page origin with typed results and the request header', async () => {
    const { client, fetchMock } = make(() =>
      Promise.resolve(json({ status: 'ok', version: '0.1.0' })),
    );

    const { data } = await client.GET('/api/v1/health');

    expect(data?.version).toBe('0.1.0');
    const request = fetchMock.mock.calls[0]?.[0];
    expect(request?.url).toBe(new URL('/api/v1/health', document.baseURI).href);
    expect(request?.credentials).toBe('same-origin');
    expect(request?.headers.get('X-Titan-Request')).toBe('1');
  });

  it('marks the node unreachable when the request fails, and passes the error on', async () => {
    const { client, connection } = make(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(client.GET('/api/v1/health')).rejects.toThrow('Failed to fetch');
    expect(connection.getStatus()).toBe('offline');
  });

  it('does not count a cancelled request as a lost connection', async () => {
    const { client, connection } = make(() =>
      Promise.reject(new DOMException('The operation was aborted.', 'AbortError')),
    );

    await expect(client.GET('/api/v1/health')).rejects.toThrow('aborted');
    expect(connection.getStatus()).toBe('online');
  });

  it('marks the node reachable again on any answer from it, errors included', async () => {
    const { client, connection } = make(() =>
      Promise.resolve(
        json({ title: 'Unauthorized', status: 401 }, 401, 'application/problem+json'),
      ),
    );
    connection.reportFailure();

    const { error } = await client.GET('/api/v1/me');

    expect(error).toBeDefined();
    expect(connection.getStatus()).toBe('online');
  });

  it('treats a gateway error from in front of the node as unreachable', async () => {
    const { client, connection } = make(() =>
      Promise.resolve(new Response('Bad Gateway', { status: 502 })),
    );

    await client.GET('/api/v1/health');
    expect(connection.getStatus()).toBe('offline');
  });
});

describe('isNodeAnswer', () => {
  it('accepts ordinary statuses and TITAN problem responses', () => {
    expect(isNodeAnswer(new Response(null, { status: 204 }))).toBe(true);
    expect(isNodeAnswer(new Response('', { status: 500 }))).toBe(true);
    expect(
      isNodeAnswer(
        new Response('{}', {
          status: 503,
          headers: { 'Content-Type': 'application/problem+json' },
        }),
      ),
    ).toBe(true);
  });

  it('rejects gateway errors without a problem body', () => {
    for (const status of [502, 503, 504]) {
      expect(isNodeAnswer(new Response('', { status }))).toBe(false);
    }
  });
});
