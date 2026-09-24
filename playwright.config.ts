import { defineConfig, devices, type Project } from '@playwright/test';

const port = 4173;
const isCI = process.env['CI'] !== undefined;

// A system Chromium can stand in for Playwright's own browsers, for example
// where downloading them is not possible. Only the Chromium projects run then.
const chromiumPath = process.env['PLAYWRIGHT_CHROMIUM_PATH'];
const chromiumLaunch =
  chromiumPath === undefined ? {} : { launchOptions: { executablePath: chromiumPath } };

const chromiumProjects: Project[] = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], ...chromiumLaunch } },
  { name: 'chromium-phone', use: { ...devices['Pixel 7'], ...chromiumLaunch } },
];

const otherProjects: Project[] = [
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'webkit-phone', use: { ...devices['iPhone 15'] } },
];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: chromiumPath === undefined ? [...chromiumProjects, ...otherProjects] : chromiumProjects,
  // The production build, served with the node's security headers (see
  // security-headers.ts). Run `pnpm build` first. Vite is started directly:
  // through pnpm, it would outlive the test run.
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !isCI,
  },
});
