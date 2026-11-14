# Setup

## Requirements
Docker Desktop. Nothing else is needed on the host.

## First run
```bash
cp .env.example .env
docker compose up --build        # db, redis, api (3100), sidekiq, web (3101)
```
The API container runs `db:prepare` on start.

## Common commands
```bash
docker compose exec api bin/rails console
docker compose exec api bin/rails db:migrate
docker compose run --rm --no-deps web npm install <pkg>   # after changing web dependencies
docker compose run --rm --no-deps api bundle add <gem>   # then: docker compose build api sidekiq
bin/check
```
After adding a gem or npm package, rebuild the images (`docker compose build`) so the Dockerfile cache stays current.

## Environment variables (see `.env.example`)
| Name | Used by | Purpose |
|---|---|---|
| POSTGRES_USER / POSTGRES_PASSWORD | db, api | Local database credentials (dev defaults only) |
| DB_PORT, API_PORT, WEB_PORT | compose | Host ports |
| CORS_ORIGINS | api | Comma-separated allowed web origins |
| REDIS_URL | api, sidekiq | Set by compose |
| SIDEKIQ_CONCURRENCY | sidekiq | Worker threads |
| NEXT_PUBLIC_API_URL | web | API base URL seen by the browser (public, never put secrets here) |
| STORAGE_SERVICE | api | `local` (disk) or `s3` |
| S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, S3_BUCKET, S3_ENDPOINT | api | S3-compatible storage |

Secrets are never committed: `.env` is git-ignored; production secrets come from the host environment.

## Natural voices (`bin/audio`)
The app plays recorded audio when an item has it, and falls back to the best English voice in the browser otherwise.
Recordings are made locally with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (open model, CPU, no cloud service):
```bash
bin/audio              # list every word, example sentence, lesson and dialogue line; make the missing files; attach them
bin/audio --limit 20   # try the voices first
```
- Output goes to `api/tmp/audio/` (git-ignored); `rails audio:attach` stores each file in Active Storage on the right record.
- Dialogues use one voice per speaker; lessons are joined from per-line clips with short pauses.
- The model files (~340 MB) live in `tools/tts/models/` (git-ignored) and are downloaded on first run.
- Re-running only makes what is missing. After adding or editing content, run `bin/audio` again.
