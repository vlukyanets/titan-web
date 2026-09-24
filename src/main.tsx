import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App.tsx';
import { createQueryClient, followConnection } from '@/app/queryClient.ts';
import { createAppRouter } from '@/app/router.tsx';
import { connection } from '@/shared/api';
import { I18nProvider, loadMessages, pickLocale } from '@/shared/i18n';
import { applyThemeChoice, readThemeChoice } from '@/shared/ui';
import '@/app/styles.css';

// Applied before the first render; there is no inline script to do it earlier
// because the node's CSP forbids inline scripts.
applyThemeChoice(readThemeChoice(), document.documentElement);

connection.watchBrowser(window);
followConnection(connection);

async function start(root: HTMLElement) {
  const locale = pickLocale(navigator.languages);
  const messages = await loadMessages(locale);
  createRoot(root).render(
    <StrictMode>
      <I18nProvider locale={locale} messages={messages}>
        <App queryClient={createQueryClient()} router={createAppRouter()} />
      </I18nProvider>
    </StrictMode>,
  );
}

const root = document.getElementById('root');
if (root === null) {
  throw new Error('index.html has no #root element');
}
void start(root);
