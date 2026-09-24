# 0002. The Web UI is served by the TITAN node

- Status: Accepted
- Date: 2026-09-24

## Context

The Web UI needs a place to be served from. Every TITAN node already runs the
API on its tailnet address, and nothing may be exposed outside the tailnet
([product spec](https://github.com/vlukyanets/titan/blob/master/docs/spec/product.md#surfaces-v1)).
The owner runs a few machines at home and does not want another service to
install, update and keep in step with the API. Signing in should be a plain
username and password, without a pairing step.

## Options

1. **The node serves the built files** next to its API, on the same address.
   The browser and the API share one origin: no CORS, no extra port, and the
   session can be an ordinary same-site cookie. The UI and the API ship
   together, so they always match. The node's image grows by the size of the
   build, a few megabytes.
2. **A separate static server** (a small nginx container) on each node. The UI
   can be released on its own, but it is one more service per node, the API
   needs CORS, and a cookie session across two origins gets harder and weaker.
3. **A server-side rendering runtime** (Node.js) on each node. It adds a second
   runtime to every machine for pages that only the owner's household opens,
   and the API still needs its own authentication for the other clients.

## Decision

Option 1. The UI is built into static files, and every node serves them:

- `/api/…` stays the API. Every other path is the UI: files under `/assets/`
  are served with content hashes in their names and cached for a year; any
  other `GET` answers `index.html` with `Cache-Control: no-cache`, so the UI's
  router handles deep links.
- `index.html` is served with a strict `Content-Security-Policy` (scripts
  only from the node, no inline scripts, no framing) and the other security
  headers listed in the backend's ADR 0012.
- The titan image contains a pinned release of this UI: titan-web's CI
  publishes each release as an archive, and titan's image build downloads the
  pinned version and checks its SHA-256. Upgrading the UI on a node is
  upgrading the node.
- For development the node can serve a local build from a directory given in
  its settings, or the UI's development server can proxy `/api` to a node.
- Signing in uses the node's cookie sessions, described in the backend's
  [ADR 0012](https://github.com/vlukyanets/titan/blob/master/docs/adr/0012-browser-sessions-for-the-web-ui.md).

## Consequences

- Nothing to host or configure beyond the node itself.
- The UI can only be built as static files: no server-side rendering. This
  is enough for a tailnet-only app for a household.
- A UI release reaches users only through a titan release that pins it. The
  pin says which API the UI was built against, so they never drift apart.
- Each node address is its own origin, so a user signs in separately on each
  node they open.
- titan needs follow-up work: the static route, the settings for a local build,
  and the pinned download in its image.
