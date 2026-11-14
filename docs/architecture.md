# Architecture

```
Browser (Next.js App Router, TypeScript, Tailwind, shadcn/ui)
   │  fetch /api/v1 (JSON, Bearer token from M1)
   ▼
Rails API-only → controllers (thin) → services / query objects → ActiveRecord models
   ├─ PostgreSQL        data, constraints, indexes
   ├─ Redis + Sidekiq   background jobs (ActiveJob adapter)
   └─ Active Storage    audio; local disk in dev, S3-compatible in production
```

## Conventions
- Business logic lives in `api/app/services` (and query objects); controllers only parse, authorize and render.
- Web: `src/lib/api` is the typed API client, `src/features/<name>` holds hooks and components. No business logic in
  pages or components.
- All API errors: `{ "error": { "code", "message", "details" } }` (`Api::V1::BaseController#render_error`).
- Timestamps are stored in UTC; the client formats them in the user's time zone.
- Tests: RSpec (api), Vitest (web unit/component). Playwright E2E arrives with the first full user flow (M3).
- Review history is immutable; review submissions are idempotent via `client_request_id` (M3).
