import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createConnection, type Connection } from './connection.ts';

const ok = () => Promise.resolve(new Response('{}', { status: 200 }));
const unreachable = () => Promise.reject(new TypeError('Failed to fetch'));

describe('createConnection', () => {
  let connection: Connection | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    connection?.dispose();
    vi.useRealTimers();
  });

  const make = (fetch: typeof globalThis.fetch) => {
    connection = createConnection({
      healthUrl: '/api/v1/health',
      fetch,
      minProbeDelayMs: 1_000,
      maxProbeDelayMs: 4_000,
    });
    return connection;
  };

  it('starts online and notifies listeners only on changes', () => {
    const c = make(vi.fn(ok));
    const listener = vi.fn();
    c.subscribe(listener);

    expect(c.getStatus()).toBe('online');
    c.reportSuccess();
    expect(listener).not.toHaveBeenCalled();

    c.reportFailure();
    c.reportFailure();
    expect(c.getStatus()).toBe('offline');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('checks the health endpoint with a growing delay until the node answers', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementationOnce(unreachable)
      .mockImplementationOnce(unreachable)
      .mockImplementationOnce(unreachable)
      .mockImplementation(ok);
    const c = make(fetch);

    c.reportFailure();
    await vi.advanceTimersByTimeAsync(999);
    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/v1/health', { cache: 'no-store' });

    await vi.advanceTimersByTimeAsync(2_000);
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(c.getStatus()).toBe('offline');

    // Capped at the longest delay.
    await vi.advanceTimersByTimeAsync(3_999);
    expect(fetch).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(c.getStatus()).toBe('online');

    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('treats an error answer from the health endpoint as still offline', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response('', { status: 502 }))
      .mockImplementation(ok);
    const c = make(fetch);

    c.reportFailure();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(c.getStatus()).toBe('offline');
    await vi.advanceTimersByTimeAsync(2_000);
    expect(c.getStatus()).toBe('online');
  });

  it('stops checking when a request succeeds', async () => {
    const fetch = vi.fn(unreachable);
    const c = make(fetch);

    c.reportFailure();
    c.reportSuccess();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetch).not.toHaveBeenCalled();
    expect(c.getStatus()).toBe('online');
  });

  it('follows the browser and checks the node as soon as the browser is back', async () => {
    const fetch = vi.fn(ok);
    const c = make(fetch);
    const target = new EventTarget();
    const stop = c.watchBrowser(target);

    target.dispatchEvent(new Event('offline'));
    expect(c.getStatus()).toBe('offline');

    target.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(c.getStatus()).toBe('online');

    stop();
    target.dispatchEvent(new Event('offline'));
    expect(c.getStatus()).toBe('online');
  });

  it('checks the node when it starts offline', async () => {
    const fetch = vi.fn(ok);
    connection = createConnection({
      healthUrl: '/api/v1/health',
      fetch,
      minProbeDelayMs: 1_000,
      initialStatus: 'offline',
    });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(connection.getStatus()).toBe('online');
  });
});
