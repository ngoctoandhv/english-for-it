# Deployment

Production images are built from the repository root:
```bash
docker build -f docker/api.prod.Dockerfile -t english-for-it-api .
docker build -f docker/web.prod.Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t english-for-it-web .
```
Both builds and a smoke test (migrations, health, host authorization, headers) were run locally during M7.

## Single host with Docker Compose
1. `cp .env.production.example .env.production` and fill every `CHANGE_ME` (generate `SECRET_KEY_BASE` with `openssl rand -hex 64`).
2. `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build`
3. Put a TLS-terminating reverse proxy in front: `api.example.com` → `api:3000`, `app.example.com` → `web:3000`. The API trusts `X-Forwarded-Proto`.
4. Create the first admin: `docker compose -f docker-compose.prod.yml exec api bin/rails admin:create EMAIL=you@example.com NAME="You" PASSWORD='…'`
5. Import the draft content with `bin/rails db:seed` (imports as `draft`), then review and publish it in the admin.

## Environment variables
See `docs/setup.md` and `.env.production.example`. Required in production: `SECRET_KEY_BASE`, `DATABASE_URL`, `REDIS_URL`,
`ALLOWED_HOSTS`, `CORS_ORIGINS`, `API_PUBLIC_URL`, and `NEXT_PUBLIC_API_URL` (build argument for the web image).

## Operations
- Health: `GET /up` (liveness) and `GET /api/v1/health` (database and Redis).
- Migrations run on container start (`db:prepare`). The schema is `db/structure.sql` (contains the review-log trigger), so the image includes `psql` 17.
- Audio: use S3-compatible storage (`STORAGE_SERVICE=s3`); local disk is not shared between containers.
- Backups: back up the Postgres volume/database and the audio bucket. Review history is append-only and valuable.
- Sidekiq runs from the same image (`bundle exec sidekiq -C config/sidekiq.yml`). No jobs are scheduled in the MVP.
- CI: `.github/workflows/ci.yml` runs `bin/check --build` and the E2E suite (written, not yet run on GitHub).
