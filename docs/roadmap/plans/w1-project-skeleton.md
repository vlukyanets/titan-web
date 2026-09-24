# Plan: W1 project skeleton

Implements milestone [W1](../milestones.md): an empty app with navigation that
builds in CI and ships a release archive a node can serve. It follows
[ADR 0002](../../adr/0002-served-by-the-node.md) (served by the node),
[ADR 0003](../../adr/0003-openapi-generated-client.md) (generated client) and
[ADR 0004](../../adr/0004-frontend-framework.md) (libraries), and the layout of
the [architecture overview](../../architecture/overview.md).

Branch `feature/w1-project-skeleton`, stacked on `spec/m3-web-foundation-docs`.

## Decisions

- **Node 24 in CI, Node 22.12 or newer locally**, the range Vite 8 supports.
  pnpm is pinned through `packageManager` and run with Corepack.
- **TypeScript 5.9**, not 7. The current `typescript-eslint` accepts only
  TypeScript below 6.1 and `openapi-typescript` only 5.x. Move up when both do.
- **Code-based routes** in `src/app/router.tsx` instead of the router's
  file-based generator, so each screen stays in its feature folder and no
  generated route tree is committed. Routes stay fully typed.
- **Folder boundaries are lint errors.** Imports that leave the current folder
  use the `@/` alias. A feature may import only itself and `@/shared/*`;
  `src/shared` imports neither features nor `src/app`.
- **No raw HTML.** ESLint forbids `dangerouslySetInnerHTML`, `innerHTML`,
  `outerHTML`, `insertAdjacentHTML` and `document.write`, so the build keeps
  working under Trusted Types.
- **Translations** are one JSON file per language in `src/shared/i18n/messages/`,
  found with `import.meta.glob`, so a new language is only a new file. English is
  the source: message ids are typed from `en.json`, and a test checks that every
  other file has the same ids and valid ICU syntax. Missing languages fall back
  to English.
- **Theme** follows the system through `prefers-color-scheme`; a manual choice
  is kept in `localStorage` (a preference, not a secret) and applied as
  `data-theme` on `<html>` before the first render. No inline script, because
  the node's CSP forbids it.
- **Connection state** is a small store fed by the API client's middleware
  (network errors, and `502`/`503`/`504` that are not TITAN problem responses),
  the browser's `online` and `offline` events, and a `GET /api/v1/health` poll
  with backoff while offline. It drives TanStack Query's `onlineManager`, so
  queries pause offline, keep their data and refresh quietly on reconnect.
- **The Playwright smoke test runs the production build under the node's
  headers.** `vite preview` sends the `Content-Security-Policy` and other
  headers from titan ADR 0012 (without HSTS, since it is plain HTTP), and the
  test fails on any CSP or Trusted Types violation. End-to-end tests against a
  real node come with W2.
- **Release archive** `titan-web-<version>.tar.gz` holds the contents of
  `dist/` at its root, built with sorted names, fixed times and owners, and
  `gzip -n`, so the same commit always gives the same SHA-256. CI uploads it
  on every run; a `v<version>` tag publishes it with its `.sha256` file as a
  GitHub release, which titan's image build pins.

## Tasks

- [x] This plan.
- [x] pnpm, Vite, React and strict TypeScript; ESLint, Prettier and Vitest.
- [ ] Tailwind theme with light and dark tokens, layout, router with a stub for
      every screen, connection state and the offline indicator.
- [x] Translation layer with English, Russian and Ukrainian.
- [ ] `openapi/openapi.json`, generated types and the API client.
- [ ] Playwright smoke test under the strict CSP.
- [ ] `CI TITAN Web` workflow and the release archive.
- [ ] CLAUDE.md commands, README and architecture updated.
