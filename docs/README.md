# TITAN Web documentation

This folder holds the **permanent** documentation for the Web UI. Planning
material that changes often lives separately in [`roadmap/`](roadmap/README.md).

The product as a whole (domains, users, autonomy policy) is specified in the
backend repository:
[titan/docs](https://github.com/vlukyanets/titan/blob/master/docs/README.md).

## Specification

- [Web UI spec](spec/web.md): serving and signing in, screens, language,
  offline behaviour, notifications

## Architecture

- [Overview](architecture/overview.md): deployment, stack, layout, data flow,
  streaming, security

## Decisions

| ADR | Title | Status |
|---|---|---|
| [0001](adr/0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](adr/0002-served-by-the-node.md) | The Web UI is served by the TITAN node | Accepted |
| [0003](adr/0003-openapi-generated-client.md) | API client generated from the backend's OpenAPI schema | Accepted |
| [0004](adr/0004-frontend-framework.md) | Frontend framework | Proposed |

New ADRs start from the [template](adr/0000-template.md).

## Process

- [Contributing: commits and pull requests](CONTRIBUTING.md)
- [Roadmap (volatile)](roadmap/README.md)
