# ADR 001 – Foundations (M0)
- New monorepo `english-for-it` (`api/` Rails API-only, `web/` Next.js); existing projects are reference only.
- Sidekiq + Redis through ActiveJob; Solid Queue/Cache/Cable skipped.
- RSpec (api) and Vitest (web). Playwright deferred to M3, when a real flow exists.
- Dev runs fully in Docker; Postgres 17, Redis 7, Ruby 3.4, Node 22.
- API errors use one shape; CORS origins come from `CORS_ORIGINS`.
