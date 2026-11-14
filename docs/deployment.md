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
See `docs/setup.md` and `.env.production.example`. Required in production: `SECRET_KEY_BASE`, `DATABASE_URL`,
`ALLOWED_HOSTS`, `CORS_ORIGINS`, `API_PUBLIC_URL`, and `NEXT_PUBLIC_API_URL` (build argument for the web image).

## Operations
- Health: `GET /up` (liveness) and `GET /api/v1/health` (database).
- Migrations run on container start (`db:prepare`). The schema is `db/structure.sql` (contains the review-log trigger), so the image includes `psql` 17.
- Audio: use S3-compatible storage (`STORAGE_SERVICE=s3`); local disk is not shared between containers.
- Backups: back up the Postgres volume/database and the audio bucket. Review history is append-only and valuable.
- CI: `.github/workflows/ci.yml` runs `bin/check --build` and the E2E suite (written, not yet run on GitHub).

## Reminders and installable app (free)
- **Install:** the web app ships a manifest, icons and a service worker, so browsers offer "Install". Settings has an Install button when the browser allows it.
- **Reminders:** daily Web Push at the hour the learner picks (their own time zone), plus a Monday recap. No streak or guilt wording. Needs `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (generate with `rails push:keys`) and `CRON_SECRET`. Without VAPID keys the Settings section says reminders are unavailable.
- **Scheduler without a worker:** `.github/workflows/reminders.yml` calls `POST /api/v1/internal/reminders` every hour with the secret (GitHub Actions scheduled workflows are free; repository secrets `API_URL` and `CRON_SECRET`). Any free cron service works the same way. The endpoint does nothing for users whose chosen hour is not now, and sends each user at most one reminder per local day.
- iPhone: Web Push works only after the user adds the app to the Home Screen (iOS 16.4+).
