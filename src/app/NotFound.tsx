import { Link } from '@tanstack/react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDocumentTitle } from '@/shared/ui';

export function NotFound() {
  const intl = useIntl();
  useDocumentTitle(intl.formatMessage({ id: 'notFound.title' }));

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        <FormattedMessage id="notFound.title" />
      </h1>
      <p className="text-muted-foreground">
        <FormattedMessage id="notFound.body" />
      </p>
      <Link to="/" className="inline-block text-primary underline underline-offset-4">
        <FormattedMessage id="notFound.home" />
      </Link>
    </section>
  );
}
