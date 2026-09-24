import { createMemoryHistory } from '@tanstack/react-router';
import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { connection } from '@/shared/api';
import { I18nProvider } from '@/shared/i18n';
import en from '@/shared/i18n/messages/en.json';
import { App } from './App.tsx';
import { createQueryClient } from './queryClient.ts';
import { createAppRouter } from './router.tsx';

function renderAt(path: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(
    <I18nProvider locale="en" messages={en}>
      <App queryClient={createQueryClient()} router={router} />
    </I18nProvider>,
  );
  return router;
}

describe('App', () => {
  afterEach(() => {
    act(() => {
      connection.reportSuccess();
    });
  });

  it('shows the screen for the address and marks it in the menu', async () => {
    renderAt('/tasks');

    expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    const menu = screen.getByRole('navigation', { name: 'Main menu' });
    expect(within(menu).getByRole('link', { name: 'Tasks' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(menu).getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');
    expect(document.title).toBe('Tasks · TITAN');
  });

  it('lists every screen of the spec in the menu', async () => {
    renderAt('/');

    const menu = await screen.findByRole('navigation', { name: 'Main menu' });
    expect(
      within(menu)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      'Today',
      'Chat',
      'Tasks',
      'Calendar',
      'Notes',
      'Trackers',
      'Reminders',
      'Notifications',
      'Activity',
      'Settings',
      'Household',
    ]);
  });

  it('answers an unknown address with a page inside the layout', async () => {
    renderAt('/no-such-page');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
  });

  it('shows the offline indicator while the node is unreachable, keeping the page', async () => {
    renderAt('/notes');
    await screen.findByRole('heading', { level: 1, name: 'Notes' });
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();

    act(() => {
      connection.reportFailure();
    });
    expect(within(screen.getByRole('status')).getByText('Offline')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Notes' })).toBeInTheDocument();

    act(() => {
      connection.reportSuccess();
    });
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });
});
