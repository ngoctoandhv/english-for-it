# ADR 001 – Foundations (M0)
- New monorepo `english-for-it` (`api/` Rails API-only, `web/` Next.js); existing projects are reference only.
- ActiveJob with the :async adapter (Sidekiq + Redis removed 2026-11-14: no jobs yet). Add Solid Queue or Sidekiq when durable jobs are needed.
- RSpec (api) and Vitest (web). Playwright deferred to M3, when a real flow exists.
- Dev runs fully in Docker; Postgres 17, Ruby 3.4, Node 22.
- API errors use one shape; CORS origins come from `CORS_ORIGINS`.
