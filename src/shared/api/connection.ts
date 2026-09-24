export type ConnectionStatus = 'online' | 'offline';

export interface ConnectionOptions {
  /** Unauthenticated endpoint that answers while the node is up. */
  healthUrl: string;
  fetch?: typeof fetch;
  /** First delay between health checks while offline. */
  minProbeDelayMs?: number;
  /** Longest delay between health checks; the delay doubles up to it. */
  maxProbeDelayMs?: number;
  /** Initial state; `navigator.onLine === false` is the only sure sign. */
  initialStatus?: ConnectionStatus;
}

// Function properties rather than methods: they are passed around unbound,
// for example to useSyncExternalStore.
export interface Connection {
  getStatus: () => ConnectionStatus;
  subscribe: (listener: () => void) => () => void;
  /** A request could not reach the node. */
  reportFailure: () => void;
  /** A request got an answer from the node. */
  reportSuccess: () => void;
  /** Follows the browser's `online` and `offline` events; returns a stop function. */
  watchBrowser: (target: Pick<Window, 'addEventListener' | 'removeEventListener'>) => () => void;
  dispose: () => void;
}

/**
 * The shared connection state behind the offline indicator. Requests report
 * whether they reached the node; while it is unreachable the state checks
 * the health endpoint with a growing delay until the node answers again.
 */
export function createConnection({
  healthUrl,
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
  minProbeDelayMs = 2_000,
  maxProbeDelayMs = 30_000,
  initialStatus = 'online',
}: ConnectionOptions): Connection {
  let status = initialStatus;
  let probeDelay = minProbeDelayMs;
  let probeTimer: ReturnType<typeof setTimeout> | undefined;
  let probing = false;
  let disposed = false;
  const listeners = new Set<() => void>();

  const setStatus = (next: ConnectionStatus) => {
    if (next === status) {
      return;
    }
    status = next;
    for (const listener of listeners) {
      listener();
    }
  };

  const cancelProbe = () => {
    clearTimeout(probeTimer);
    probeTimer = undefined;
  };

  const probe = async () => {
    probeTimer = undefined;
    probing = true;
    try {
      const response = await fetchImpl(healthUrl, { cache: 'no-store' });
      if (response.ok) {
        reportSuccess();
        return;
      }
    } catch {
      // Unreachable; try again later.
    } finally {
      probing = false;
    }
    if (status === 'offline') {
      probeDelay = Math.min(probeDelay * 2, maxProbeDelayMs);
      scheduleProbe(probeDelay);
    }
  };

  function scheduleProbe(delay: number) {
    if (disposed || probing) {
      return;
    }
    cancelProbe();
    probeTimer = setTimeout(() => void probe(), delay);
  }

  function reportFailure() {
    if (status === 'online') {
      probeDelay = minProbeDelayMs;
      setStatus('offline');
      scheduleProbe(probeDelay);
    }
  }

  function reportSuccess() {
    cancelProbe();
    probeDelay = minProbeDelayMs;
    setStatus('online');
  }

  if (status === 'offline') {
    scheduleProbe(probeDelay);
  }

  return {
    getStatus: () => status,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reportFailure,
    reportSuccess,
    watchBrowser(target) {
      const onOffline = () => {
        reportFailure();
      };
      // The browser being online says nothing about the node: check it now.
      const onOnline = () => {
        if (status === 'offline') {
          probeDelay = minProbeDelayMs;
          scheduleProbe(0);
        }
      };
      target.addEventListener('offline', onOffline);
      target.addEventListener('online', onOnline);
      return () => {
        target.removeEventListener('offline', onOffline);
        target.removeEventListener('online', onOnline);
      };
    },
    dispose() {
      disposed = true;
      cancelProbe();
      listeners.clear();
    },
  };
}
