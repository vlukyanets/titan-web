# Milestones

Last updated: 2026-09-24.

The Web UI is part of backend milestone M3
([titan milestones](https://github.com/vlukyanets/titan/blob/master/docs/roadmap/milestones.md)).

## W1: Project skeleton

- [ ] React, Vite and pnpm project with the libraries of
      [ADR 0004](../adr/0004-frontend-framework.md), strict TypeScript and
      the layout from the [architecture overview](../architecture/overview.md).
- [ ] Theme (light and dark), layout scaffold, router, offline indicator.
- [ ] Translation layer with English, Russian and Ukrainian message files.
- [ ] ESLint, Prettier, Vitest, a Playwright smoke test, GitHub Actions CI
      named `CI TITAN Web` (type check, lint, test, build) and a release archive.
- [ ] Generated API types from a copy of the backend's schema.

Exit: an empty app with navigation builds in CI and its release archive can be
served by a node.

## W2: Sign-in and chat

Depends on backend M1 and the browser sessions of
[titan ADR 0012](https://github.com/vlukyanets/titan/blob/master/docs/adr/0012-browser-sessions-for-the-web-ui.md),
and on titan serving the pinned UI build.

- [ ] Sign-in page, sign-out, return to the requested page after a `401`.
- [ ] Connection state and the offline rules.
- [ ] Chat threads with streaming, tool activity and inline approvals.

Exit: sign in on a node, chat with streaming, approve an action, and stop and
start the node without losing page content.

## W3: Domain screens

Depends on backend M2.

- [ ] Today.
- [ ] Tasks and projects, with a table view.
- [ ] Calendar day, week and month views.
- [ ] Notes, search and the memory list.
- [ ] Trackers with quick logging and charts.
- [ ] Reminders and the notification list.

Exit: the acceptance criteria in the [Web UI spec](../spec/web.md) pass for
these screens.

## W4: Settings and household

- [ ] Settings: account, language, time zone, devices, autonomy overrides,
      usage and budget.
- [ ] Activity: the audit log with Undo.
- [ ] Household for the owner: members, devices, default policies, usage and
      budgets.
- [ ] Accessibility pass on every screen.

Exit: the owner can run the household from the browser without the CLI for
everyday tasks.

## Open questions

- Browser push notifications after v1, and through which push service?
- Should the UI be installable as a Progressive Web App on phones and
  desktops?
