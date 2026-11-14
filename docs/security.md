# Security review (M7)

Scope: the API (`api/`), the web app (`web/`), the Docker/CI setup. Reviewed against the MVP feature set.

## What is covered (and tested)
| Area | Control | Test |
|---|---|---|
| Authentication | bcrypt passwords (min 10), signed 15-min access token, rotating hashed refresh token with reuse detection | `auth_spec`, `me_spec`, `security_spec` |
| Authorization | learners vs admins; every `/api/v1/admin/*` route is checked to reject anonymous (401) and learners (403) | `security_spec` iterates all routes |
| Authentication coverage | every non-public learner route is checked to require a token | `security_spec` iterates all routes |
| Data isolation | sessions, session items, reviews, history, progress, attempts, favorites are scoped to `current_user` | `security_spec`, `learning_spec` |
| Mass assignment | strong parameters everywhere; `role` can never be set through public endpoints | `auth_spec`, `me_spec` |
| Server-side truth | quiz, listening and review answers are graded/validated on the server; the answer key is never sent to learners | `listening_spec`, `dashboard_spec` |
| Idempotency | duplicate review submissions return the first result (`client_request_id` unique per user) | `learning_spec` |
| Immutability | `review_logs` cannot be updated or deleted (Ruby `readonly?` + Postgres trigger) | `learning_spec` |
| Input | JSON body guard (malformed → 400, > 1 MB → 413), SQL via bound parameters, `ILIKE` input escaped, audio upload limited to `audio/*` ≤ 5 MB | `security_spec`, `admin_vocabulary_spec` |
| Brute force | rack-attack: 10 auth POSTs/min/IP, 600 API requests/5 min/IP (both configurable: AUTH_THROTTLE_LIMIT, API_THROTTLE_LIMIT; raised only in the local .env) | `rate_limit_spec` |
| Secrets in logs | `password`, `email`, `token` are filtered | `security_spec` |
| Transport / hosts | production forces HTTPS (behind a TLS proxy), `ALLOWED_HOSTS` host authorization, CORS from `CORS_ORIGINS` | checked on the production image |
| Browser hardening | CSP, HSTS (production), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | checked on the production image |
| Dependencies | `brakeman`, `bundler-audit`, `npm audit --omit=dev` (0 vulnerabilities at the time of writing) | `bin/check` |

## Accepted risks and follow-ups
1. **Tokens in `localStorage`** (ADR 002): readable by injected scripts. Mitigated by React escaping and CSP; revisit with httpOnly cookies if a backend-for-frontend is added.
2. **CSP allows `'unsafe-inline'` scripts** because Next.js injects inline bootstrap scripts. Move to nonce-based CSP via a proxy/middleware when hardening further.
3. **Audio URLs are public** (signed, unguessable Active Storage URLs, no login required) so that `<audio>` can load them. Content is not secret. Use S3 pre-signed URLs with short expiry if that changes.
4. **No email verification or password reset yet** (not in the MVP scope). Add before opening public sign-up widely.
5. **No account lockout**, only IP throttling. Consider per-account throttling.
6. **Content is draft**: seeded vocabulary, listening and scenarios must be reviewed by a human before publishing (`docs/content/README.md`).
7. **Dev-only credentials** (`admin@example.test`, `learner@example.test`) exist only when seeding in development. They must never exist in production: `db/seeds.rb` loads them only in the development environment.

## Account recovery, export and erasure
- Reset and verification tokens use `generates_token_for` (signed, expiring). The reset token embeds the password salt, so it stops working after one use.
- `POST /auth/password/forgot` returns 204 for every email; send failures are logged, never shown. It has its own throttle (`MAIL_THROTTLE_LIMIT`, default 5 per 10 minutes per IP).
- `review_logs` stay immutable (UPDATE and DELETE are blocked by a trigger). The single exception is account erasure: `Accounts::Erase` sets the transaction-local setting `app.erase_account` before deleting that user's rows.
- Email is sent over any SMTP provider (`SMTP_ADDRESS`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, `WEB_URL`). In development mail is written to `api/tmp/mails`.
