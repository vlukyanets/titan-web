import { useEffect } from 'react';
import { useIntl } from 'react-intl';

export function useDocumentTitle(screen: string): void {
  const intl = useIntl();
  useEffect(() => {
    document.title = intl.formatMessage({ id: 'document.title' }, { screen });
  }, [intl, screen]);
}
