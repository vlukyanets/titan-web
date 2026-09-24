# API schema copy

`openapi.json` is a copy of the backend's
[`docs/api/openapi.json`](https://github.com/vlukyanets/titan/blob/master/docs/api/openapi.json).
The UI's API types are generated from it
([ADR 0003](../docs/adr/0003-openapi-generated-client.md)); the generated file
is not committed.

To update it, copy the file from a backend commit or tag, run
`pnpm generate` and `pnpm typecheck`, and name the backend commit in the
commit message. Never edit the copy by hand.

Current source: titan `3059983` (branch `spec/m3-web-foundation-docs`).
