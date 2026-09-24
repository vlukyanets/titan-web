import { FormattedMessage, useIntl } from 'react-intl';
import type { MessageId } from '@/shared/i18n';
import { useDocumentTitle } from './useDocumentTitle.ts';

interface ScreenPlaceholderProps {
  titleId: MessageId;
}

/** Stands in for a screen until its milestone builds it. */
export function ScreenPlaceholder({ titleId }: ScreenPlaceholderProps) {
  const intl = useIntl();
  const heading = intl.formatMessage({ id: titleId });
  useDocumentTitle(heading);

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
      <p className="text-muted-foreground">
        <FormattedMessage id="screen.placeholder" />
      </p>
    </section>
  );
}
