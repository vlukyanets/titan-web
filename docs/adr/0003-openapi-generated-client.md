# 0003. API client generated from the backend's OpenAPI schema

- Status: Accepted
- Date: 2026-09-24

## Context

The backend publishes its API contract as `docs/api/openapi.json`, generated
from FastAPI
([titan ADR 0004](https://github.com/vlukyanets/titan/blob/master/docs/adr/0004-openapi-from-fastapi.md)).
Hand-written TypeScript types would drift away from it. The Android app already
generates its client from the same file.

## Decision

The UI generates its API types from a copy of `openapi.json` at build time with
`openapi-typescript`, and calls the API through `openapi-fetch`, a thin typed
wrapper around `fetch`. Both work with any framework. The copy lives in
`openapi/openapi.json` and is updated on purpose: each update is a commit that
names the backend commit or tag it came from.

## Consequences

- An API change that breaks the UI fails its type check, not a user's screen.
- Generated code is not committed. It is rebuilt from the schema.
- Chat streams are `POST` requests answered with `text/event-stream`, which the
  browser's `EventSource` cannot send. The stream reader is written by hand on
  top of `fetch`, and it parses events into the generated event types.
- The requests carry the session cookie, not a bearer token
  ([ADR 0002](0002-served-by-the-node.md)).
