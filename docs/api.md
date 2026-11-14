# API

Base path `/api/v1`, JSON only. Errors: `{ "error": { "code", "message", "details" } }`.

## Implemented
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/v1/health | none | `{ status, database, redis }` |
| GET | /up | none | Rails liveness check |

| POST | /api/v1/auth/register | none | body `{user:{email,password,name,time_zone}}` → 201 `{user,access_token,refresh_token,expires_in}` |
| POST | /api/v1/auth/login | none | body `{user:{email,password}}` |
| POST | /api/v1/auth/refresh | none | body `{refresh_token}`; rotates tokens |
| DELETE | /api/v1/auth/logout | none | body `{refresh_token}` → 204 |
| GET | /api/v1/me | Bearer | current user |
| PATCH | /api/v1/me | Bearer | `{user:{name,level,daily_goal_minutes,time_zone}}` |
| POST | /api/v1/me/onboarding | Bearer | `{user:{level,daily_goal_minutes,time_zone}}`; sets `onboarded` |

Auth header: `Authorization: Bearer <access_token>`. Validation errors: 422 with `details` keyed by field.

Planned endpoints are listed in the Phase 1 plan; this file is updated every milestone.
