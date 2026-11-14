# API

Base path `/api/v1`, JSON only. Errors: `{ "error": { "code", "message", "details" } }`.

## Implemented
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/v1/health | none | `{ status, database, redis }` |
| GET | /up | none | Rails liveness check |

Planned endpoints are listed in the Phase 1 plan; this file is updated every milestone.
