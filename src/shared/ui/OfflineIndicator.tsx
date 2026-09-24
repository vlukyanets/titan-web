import { WifiOff } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useConnectionStatus, type Connection } from '@/shared/api';

interface OfflineIndicatorProps {
  connection?: Connection;
}

/**
 * The only place connectivity is shown (spec: offline behaviour). The live
 * region is always present so screen readers announce the change.
 */
export function OfflineIndicator({ connection }: OfflineIndicatorProps) {
  const intl = useIntl();
  const status = useConnectionStatus(connection);

  return (
    <div role="status" aria-live="polite" className="contents">
      {status === 'offline' && (
        <span
          title={intl.formatMessage({ id: 'connection.offlineDescription' })}
          className="inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-xs font-medium text-warning-foreground"
        >
          <WifiOff aria-hidden="true" className="size-3.5" />
          <FormattedMessage id="connection.offline" />
        </span>
      )}
    </div>
  );
}
