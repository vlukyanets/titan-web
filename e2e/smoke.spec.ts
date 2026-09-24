import { expect, test, type Page } from '@playwright/test';

/**
 * Collects everything the node's strict headers would break: CSP and
 * Trusted Types violations, uncaught errors and console errors.
 */
async function watchForProblems(page: Page): Promise<() => Promise<string[]>> {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      problems.push(`console: ${message.text()}`);
    }
  });
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.defineProperty(window, '__cspViolations', { value: seen });
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(
        `${event.effectiveDirective} blocked ${event.blockedURI === '' ? 'inline' : event.blockedURI}`,
      );
    });
  });
  return async () => [
    ...problems,
    ...(await page.evaluate(
      () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
    )),
  ];
}

test.beforeEach(async ({ page }) => {
  // No node runs behind the preview server; answer its health check.
  await page.route('**/api/v1/health', (route) =>
    route.fulfill({ json: { status: 'ok', version: 'e2e' } }),
  );
});

test('the build runs under the node’s Content-Security-Policy', async ({ page }) => {
  const problems = await watchForProblems(page);

  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toContain(
    "require-trusted-types-for 'script'",
  );

  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main menu' })
    .getByRole('link', { name: 'Tasks' })
    .click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Tasks' })).toBeVisible();
  await expect(page).toHaveTitle('Tasks · TITAN');

  expect(await problems()).toEqual([]);
});

test('a deep link opens its screen directly', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: 'Calendar' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('the offline indicator comes and goes without clearing the page', async ({
  page,
  context,
}) => {
  await page.goto('/notes');
  const heading = page.getByRole('heading', { level: 1, name: 'Notes' });
  const offline = page.getByText('Offline', { exact: true });
  await expect(heading).toBeVisible();
  await expect(offline).toBeHidden();

  await context.setOffline(true);
  await expect(page.getByRole('status')).toHaveText('Offline');
  await expect(heading).toBeVisible();

  // Back online, the UI checks the node's health endpoint before it clears.
  await context.setOffline(false);
  await expect(offline).toBeHidden();
  await expect(heading).toBeVisible();
});

test('a manual theme is applied and remembered', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).not.toHaveAttribute('data-theme');

  await page.getByLabel('Theme').selectOption('dark');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel('Theme')).toHaveValue('dark');
});

test.describe('in Ukrainian', () => {
  test.use({ locale: 'uk-UA' });

  test('the UI starts in the browser’s language', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Сьогодні' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });
});
