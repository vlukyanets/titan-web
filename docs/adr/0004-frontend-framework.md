# 0004. Frontend framework

- Status: Proposed
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

Not decided yet. The recommendation is **option 1, React with Vite**, because
agent-written code and ready libraries for the calendar, tables and charts
outweigh the extra boilerplate for this project. The choice also settles the
package manager, test runner, component kit and styling, which this ADR will
list once it is accepted.

## Consequences

Milestone W1 (the project skeleton) waits for this decision. Once it is made,
[CLAUDE.md](../../CLAUDE.md) gets the real commands and the architecture
overview gets the stack table.
