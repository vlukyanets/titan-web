import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App.tsx';
import { I18nProvider, loadMessages, pickLocale } from '@/shared/i18n';

async function start(root: HTMLElement) {
  const locale = pickLocale(navigator.languages);
  const messages = await loadMessages(locale);
  createRoot(root).render(
    <StrictMode>
      <I18nProvider locale={locale} messages={messages}>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}

const root = document.getElementById('root');
if (root === null) {
  throw new Error('index.html has no #root element');
}
void start(root);
