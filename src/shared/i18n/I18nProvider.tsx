import { useEffect, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { defaultLocale, type Messages } from './locales.ts';

interface I18nProviderProps {
  locale: string;
  messages: Messages;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
