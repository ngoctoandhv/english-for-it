# English for IT

Web-first English learning platform for IT professionals: 5–10 minutes a day, vocabulary in real work contexts,
spaced repetition, short listening lessons and scripted communication scenarios (no AI chat in the MVP).

Rails API (`api/`) + Next.js (`web/`), API-first (`/api/v1`) so a React Native app can reuse it later.
Everything runs in Docker; do not install Ruby gems or npm packages on the host.

## Quick start
Needs Docker Desktop running.

```bash
cp .env.example .env     # once
docker compose up --build
```

| Service | URL |
|---|---|
| Web | http://localhost:3101 |
| API health | http://localhost:3100/api/v1/health |
| Postgres (host) | localhost:5433 |

## Checks
```bash
bin/check            # rspec, rubocop, brakeman, bundler-audit, tsc, eslint, vitest
bin/check --build    # same + next build
bin/check --e2e      # also runs Playwright (needs the dev stack and seeded data)
bin/rspec [args]     # api specs only
```

## What is in the product
Learn: spaced-repetition flashcards, six quiz modes (choose, listen, type, fill the gap, say it, unit quiz), listening lessons, scripted IT scenarios with
record-and-compare speaking practice, a learning path of 16 units ordered by the learner's role and goal, a vocabulary strength view (new, learning, familiar,
solid, mastered), a career ladder with XP and a contribution calendar. Use at work: standup, incident and email builders and a phrase bank with audio.
Personal: role and goal onboarding, vocabulary placement check, Vietnamese/English interface, light/dark theme, installable app, optional daily reminder.
Accounts: password reset, email confirmation, data export and account deletion. Public: landing page with a five-word demo, glossary, privacy and terms.
Admin: content CRUD, CSV word import, path unit editor, report queue and product metrics. No AI chat, exam prep or social features.

Dev accounts (development seed only): `learner@example.test` and `admin@example.test`, password `dev-password-123`.
Run `docker compose exec api bin/rails db:seed` once to load the sample content. The sample content is **draft** and needs human review.

## Docs
- [docs/setup.md](docs/setup.md) – setup, commands, environment variables
- [docs/architecture.md](docs/architecture.md) – architecture and conventions
- [docs/api.md](docs/api.md) – API conventions and endpoints
- [docs/data-model.md](docs/data-model.md) – database schema
- [docs/security.md](docs/security.md) – security review
- [docs/deployment.md](docs/deployment.md) – production build and deploy
- [docs/content/README.md](docs/content/README.md) – content review process
- [docs/decisions/](docs/decisions) – architecture decision records
