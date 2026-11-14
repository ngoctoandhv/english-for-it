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
```

## Docs
- [docs/setup.md](docs/setup.md) – setup, commands, environment variables
- [docs/architecture.md](docs/architecture.md) – architecture and conventions
- [docs/api.md](docs/api.md) – API conventions and endpoints
- [docs/data-model.md](docs/data-model.md) – database schema
- [docs/decisions/](docs/decisions) – architecture decision records
