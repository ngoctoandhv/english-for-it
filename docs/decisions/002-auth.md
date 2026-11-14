# ADR 002 – Authentication
- Email + password (bcrypt, min 10 chars). No third-party identity provider in the MVP.
- Access token: signed (`Rails.application.message_verifier`), 15 min, stateless. Refresh token: random 48 bytes,
  only its SHA-256 digest is stored, 30 days, rotated on every use. Reusing a rotated token revokes all the user's
  active refresh tokens (theft detection).
- Bearer tokens (not cookies) so the same API serves the web app and a future React Native app.
- Web stores tokens in `localStorage`. Trade-off: readable by injected scripts (XSS). Mitigations: strict output
  escaping (React), no `dangerouslySetInnerHTML`, CSP in M7. Revisit with httpOnly cookies if a BFF is added.
- Roles: `user` and `admin`. Admins are created with `bin/rails admin:create`; the role can never be set through
  public endpoints (strong parameters exclude it, covered by specs).
- Brute force: rack-attack throttles POST `/api/v1/auth/*` to 10 per minute per IP.
