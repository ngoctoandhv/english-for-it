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
- CI: `.github/workflows/ci.yml` runs `bin/check --build` and the E2E suite (written, not yet run on GitHub: this repository has no remote yet).

## Reminders and installable app (free)
- **Install:** the web app ships a manifest, icons and a service worker, so browsers offer "Install". Settings has an Install button when the browser allows it.
- **Reminders:** daily Web Push at the hour the learner picks (their own time zone), plus a Monday recap. No streak or guilt wording. Needs `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (generate with `rails push:keys`) and `CRON_SECRET`. Without VAPID keys the Settings section says reminders are unavailable.
- **Scheduler without a worker:** `.github/workflows/reminders.yml` calls `POST /api/v1/internal/reminders` every hour with the secret (GitHub Actions scheduled workflows are free; repository secrets `API_URL` and `CRON_SECRET`). Any free cron service works the same way. The endpoint does nothing for users whose chosen hour is not now, and sends each user at most one reminder per local day.
- iPhone: Web Push works only after the user adds the app to the Home Screen (iOS 16.4+).

## Free-tier recipe (no paid service needed)
| Part | Service (free tier) | Notes |
|---|---|---|
| Web (Next.js) | Vercel Hobby, or Cloudflare Pages | Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL` (same as the public API URL). Vercel Hobby is for non-commercial use; move to Cloudflare Pages or Render if you ever charge. |
| API (Rails) | Render free web service (`render.yaml`) | Sleeps after about 15 minutes without traffic; the first request then takes 30 to 60 seconds. The hourly reminder workflow also keeps it warm for a few minutes each hour. |
| Database | Neon free Postgres 17 | Does not expire (Render's free Postgres does after 30 days). Use the pooled or direct connection string with `?sslmode=require`. Free storage is limited (about 0.5 GB), plenty for text and progress. |
| Audio files | Cloudflare R2 (10 GB free) | `STORAGE_SERVICE=s3`, `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com`, bucket, access keys. Render's disk is wiped on deploy, so do not use local storage. |
| Email | Brevo free (300 per day) or Resend free | SMTP settings in `.env.production.example`. |
| Reminders | GitHub Actions schedule | `.github/workflows/reminders.yml`. |
| Errors | Sentry free | Set `SENTRY_DSN`. No personal data is attached. |
| Backups | `.github/workflows/backup.yml` plus Neon history | Encrypted nightly dump as an artifact (private repo only). |

### Steps
1. Create the Neon project, copy the connection string. Create the R2 bucket and an API token with write access.
2. Render: New → Blueprint → select this repository (it reads `render.yaml`). Fill the variables marked `sync: false`. `ALLOWED_HOSTS` is the Render hostname without `https://`.
3. Vercel: import the repository, set the project root to `web`, add the three variables above.
4. Put the web URL in the API's `CORS_ORIGINS` and `WEB_URL`, and the API URL in `API_PUBLIC_URL`. Redeploy the API.
5. Create the first admin from the Render shell: `bin/rails admin:create EMAIL=you@example.com NAME="You" PASSWORD='...'`.
6. Seed the draft content: `bin/rails db:seed` (imports as `draft`). Review and publish it in Admin.
7. Voice files: generate them on your own machine (`bin/audio`) and upload them to R2 by running `bin/rails audio:attach` with the production `DATABASE_URL` and the `S3_*` variables set, so the files are stored in the bucket and linked to the production words.
8. GitHub repository secrets: `API_URL`, `CRON_SECRET` (reminders), `DATABASE_URL`, `BACKUP_PASSPHRASE` (backups).

### Restore a backup
```bash
gpg --batch --passphrase "$BACKUP_PASSPHRASE" -d backup.dump.gpg > backup.dump
pg_restore --no-owner --clean --if-exists -d "$DATABASE_URL" backup.dump
```
The `review_logs` trigger is part of the schema, so restore into a database prepared by `db:prepare` or restore the full dump.

### Limits to know
Cold starts on Render free; Neon and Sentry free quotas; no uptime promise. For a real launch, watch the metrics page in Admin and upgrade the API instance first.
