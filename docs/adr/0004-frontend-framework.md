# 0004. Frontend framework: React with Vite

- Status: Accepted
- Date: 2026-09-24

## Context

The UI is a single-page app built into static files that a node serves
([ADR 0002](0002-served-by-the-node.md)). It needs a router, forms, a chat that
renders a streamed reply, week and month calendar views, tables and charts, a
translation layer and light and dark themes
([spec](../spec/web.md)). Most of the code will be written by AI agents and
reviewed by one person, so a framework that agents write well and that has few
ways to do one thing matters more than raw speed. The page is opened by a
household on a local network, so bundle size matters less than on the public
web. Server-side rendering is not needed.

## Options

1. **React with Vite** (TypeScript, a router such as TanStack Router or React
   Router, TanStack Query for server data).
   - Pros: the largest ecosystem and the most examples, so agents write it
     best; mature libraries for every screen (calendars, tables, charts,
     accessible headless components such as Radix or React Aria); easy to hire
     or ask for help.
   - Cons: the most boilerplate; many competing ways to do state, styling and
     data fetching, so the project has to pin its choices in writing; larger
     bundles; re-render performance needs care in the streamed chat.
2. **Svelte 5 with SvelteKit** (static adapter, TypeScript).
   - Pros: the least code for the same screen; fine-grained reactivity makes
     the streamed chat simple; small bundles; routing, forms and build are
     one coherent kit.
   - Cons: a smaller ecosystem, so some components (a full calendar, complex
     tables) mean wrapping a plain JavaScript library or writing our own; agents
     know it less well and sometimes mix in the older Svelte 4 syntax; SvelteKit
     is built around a server, and the static mode leaves some of it unused.
3. **Vue 3 with Vite** (TypeScript, Vue Router, Pinia).
   - Pros: a middle ground: less boilerplate than React, a larger ecosystem than
     Svelte, and official router and state libraries, so fewer choices to make;
     mature component kits (Vuetify for Material, PrimeVue).
   - Cons: two styles of writing components (Options and Composition API) that
     agents mix unless the project forbids one; TypeScript support in templates
     is good but weaker than in TSX; a smaller pool of examples than React.
4. **SolidJS** or **Angular**, considered and not recommended. Solid has the
   best reactivity for streaming but the smallest ecosystem. Angular brings
   everything in one box but is heavy for a small team and its ecosystem is
   moving through large changes.
5. **Server-rendered pages with HTMX** from the backend, considered and not
   recommended: the UI would live in the titan repository as Python templates,
   there would be no generated client, and rich views such as a week calendar
   or a streamed chat with approvals would still need a lot of JavaScript.

All options work with the generated client ([ADR 0003](0003-openapi-generated-client.md)),
the cookie session and the static build.

## Decision

**Option 1: React with Vite**, because agent-written code and ready libraries
for the calendar, tables and charts outweigh the extra boilerplate for this
project. React leaves many choices open, so the project fixes them here and
agents do not add alternatives:

| Concern | Choice |
|---|---|
| Package manager | pnpm, with the lockfile committed and dependency install scripts allowed only for listed packages |
| Build and dev server | Vite, with the dev server proxying `/api` to a node |
| Routing | TanStack Router, with typed routes and search parameters |
| Server data | TanStack Query; no other global store for server data |
| Local UI state | React state and context; no Redux or similar |
| Components | shadcn/ui on Radix primitives, copied into the repository and owned by it |
| Styling | Tailwind CSS with design tokens for the light and dark themes |
| Forms | React Hook Form with Zod schemas |
| Translations | FormatJS (`react-intl`), ICU message format, one file per language |
| Calendar | FullCalendar (MIT-licensed core packages only) |
| Tables | TanStack Table |
| Charts | Recharts |
| Markdown | `react-markdown` without raw HTML |
| Unit tests | Vitest with Testing Library |
| End-to-end tests | Playwright against a real node with test data |
| Lint and format | ESLint with `typescript-eslint` in strict mode, Prettier |

Versions follow the current stable releases; the lockfile pins them, and the
manifest sets no upper bounds beyond the next major version.

## Consequences

- Milestone W1 can start: [CLAUDE.md](../../CLAUDE.md) lists the commands and
  the [architecture overview](../architecture/overview.md) the stack.
- Components from shadcn/ui are our own code: they are reviewed, tested and
  updated like the rest of the repository, not upgraded as a package.
- Streamed chat text is kept in a component of its own, so a new token
  re-renders only the reply being written.
- Replacing one of these choices needs a new ADR.
