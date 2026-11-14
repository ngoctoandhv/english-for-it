# Architecture

```
Browser (Next.js App Router, TypeScript, Tailwind, shadcn/ui)
   │  fetch /api/v1 (JSON, Bearer access token + refresh rotation)
   ▼
Rails API-only → controllers (thin) → services / query objects → ActiveRecord models
   ├─ PostgreSQL        data, constraints, indexes, review-log trigger
   ├─ ActiveJob (:async)  in-process; no background jobs in the MVP
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

## UI system
- **Look:** developer-tool style. JetBrains Mono for headings, code-like labels, IPA and numbers; Be Vietnam Pro for body text (built for Vietnamese diacritics).
  Cool slate neutrals with one green accent, `// section` headings, code-window panels, 8px radius, 44px controls.
- **Tokens:** OKLCH CSS variables in `web/src/app/globals.css` (`:root` = light, `.dark` = dark). Components use semantic roles only (`bg-card`, `text-muted-foreground`, `text-primary`, ...).
- **Theme:** light / dark / system, stored in `localStorage` (`efit.theme`); an inline script in `<head>` applies it before first paint. Provider: `src/lib/theme`.
- **Language:** English / Vietnamese UI, stored in `localStorage` (`efit.lang`), default from the browser language. Strings live in `src/lib/i18n/dictionaries.ts`
  (a Vitest test checks both languages have the same keys and placeholders). Learning content stays English with Vietnamese meanings from the database.
  The admin screens are English only.
- **Responsive:** mobile-first. Under 768px the app has a fixed bottom tab bar (safe-area aware) and the flashcard rating buttons are fixed to the bottom for thumb reach;
  from 768px up it has a top navigation. A Playwright test checks a 375px viewport for the tab bar and horizontal overflow.

## Speaking practice
Scenario lines the learner plays ("you" role) show a **Say it out loud** panel (`web/src/features/speaking`). It records the voice with
`MediaRecorder` (shadowing: hear yourself next to the model) and, where the browser has `SpeechRecognition` (Chrome, Edge, Safari), transcribes it.
`web/src/lib/speaking/compare.ts` aligns the transcript with the target line (word-level LCS, contractions expanded) and returns a match score plus
missed and extra words. Nothing is uploaded to our server; audio stays in the browser. Needs a secure context (https or localhost). The score is a
guide to how clearly a speech engine understood the learner, not a pronunciation grade.

## Public pages and SEO
`/` (landing with a five-word demo), `/glossary`, `/privacy`, `/terms` are readable signed out. `robots.txt`, `sitemap.xml` and a generated social image come from Next metadata routes; set `NEXT_PUBLIC_SITE_URL`. The glossary renders on the server using `API_INTERNAL_URL` (set by compose to `http://api:3000`; in development Rails allows that host). Legal text lives in `web/src/lib/legal/content.ts` (English and Vietnamese) and must be reviewed by a lawyer before a public launch.
