import { useSyncExternalStore } from 'react';
import type { Connection, ConnectionStatus } from './connection.ts';
import { connection as defaultConnection } from './instance.ts';

export function useConnectionStatus(connection: Connection = defaultConnection): ConnectionStatus {
  return useSyncExternalStore(connection.subscribe, connection.getStatus);
}
