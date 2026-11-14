# Architecture

```
Browser (Next.js App Router, TypeScript, Tailwind, shadcn/ui)
   │  fetch /api/v1 (JSON, Bearer access token + refresh rotation)
   ▼
Rails API-only → controllers (thin) → services / query objects → ActiveRecord models
   ├─ PostgreSQL        data, constraints, indexes, review-log trigger
   ├─ Redis + Sidekiq   background jobs (ActiveJob adapter; none scheduled in the MVP)
   └─ Active Storage    audio; local disk in dev, S3-compatible in production
```

## Conventions
- Business logic lives in `api/app/services` (`Scheduling`, `LearningSessions::{Plan,Start}`, `Reviews::Submit`, `Stats::*`,
  `Quizzes::Quick`, `ListeningGrader`, `Auth::*`); controllers only parse, authorize and render.
- Web: `src/lib/api` is the typed API client (token handling, refresh-on-401), `src/features/<name>` holds hooks and screens.
  Pure logic that is worth testing (`features/learn/keys.ts`, `features/admin/payload.ts`) lives outside components.
  Admin screens are generic and driven by `features/admin/resources.ts`.
- All API errors: `{ "error": { "code", "message", "details" } }`.
- Timestamps are stored in UTC; days (sessions, stats) are computed in the user's `time_zone`.
- Content has a `draft → reviewed → published` lifecycle; learners only see `published`.
- Learning rules: see ADR 003 (scheduling, sessions, no-guilt behaviour).

## Domain entities → tables
User, VocabularyCategory, VocabularyWord, VocabularyExample, VocabularyCollocation, LearningCollection, CollectionWord,
UserWordProgress, ReviewLog, ListeningLesson, ListeningQuestion, LearningSession, LearningSessionItem, ITScenario
(`it_scenarios`), ScenarioDialogue, UserFavorite, plus RefreshToken, ListeningAttempt, ScenarioProgress. See `docs/data-model.md`.

## Tests
RSpec (api): models, services, request specs including authorization, isolation, query counts and security.
Vitest (web): API client, keyboard mapping, admin payload building, components. Playwright: end-to-end user flows (`bin/e2e`).
