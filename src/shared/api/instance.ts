import { createConnection } from './connection.ts';

export const healthUrl = '/api/v1/health';

/** The app's one connection state, shared by every request and the layout. */
export const connection = createConnection({
  healthUrl,
  initialStatus: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online',
});
