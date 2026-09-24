import { onlineManager, QueryClient } from '@tanstack/react-query';
import type { Connection } from '@/shared/api';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // A failed refresh keeps the data already on screen; queries pause while
      // the node is unreachable and refetch quietly when it is back.
      queries: { retry: 1, staleTime: 30_000 },
      // Writes are never queued (spec: offline behaviour): they run now and
      // fail with a message instead of waiting for the connection.
      mutations: { retry: false, networkMode: 'always' },
    },
  });
}

/** Lets TanStack Query follow the app's connection state instead of the browser's. */
export function followConnection(connection: Connection): void {
  onlineManager.setEventListener((setOnline) => {
    const update = () => {
      setOnline(connection.getStatus() === 'online');
    };
    update();
    return connection.subscribe(update);
  });
}
