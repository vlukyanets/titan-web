import { Link, Outlet } from '@tanstack/react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { OfflineIndicator, ThemeSwitcher } from '@/shared/ui';
import { navigation } from './navigation.ts';

const linkClass =
  'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export function Layout() {
  const intl = useIntl();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        <FormattedMessage id="app.skipToContent" />
      </a>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          <FormattedMessage id="app.name" />
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <OfflineIndicator />
          <ThemeSwitcher />
        </div>
      </header>
      <div className="md:flex">
        <nav
          aria-label={intl.formatMessage({ id: 'nav.label' })}
          className="border-b border-border md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-56 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0"
        >
          <ul className="flex gap-1 overflow-x-auto p-2 md:flex-col">
            {navigation.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={{ exact: to === '/' }}
                  className={linkClass}
                  activeProps={{ className: 'bg-accent font-medium text-accent-foreground' }}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <FormattedMessage id={label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
