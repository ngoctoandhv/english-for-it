# API

Base path `/api/v1`, JSON only. Errors: `{ "error": { "code", "message", "details" } }`.

## Implemented
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/v1/health | none | `{ status, database }` |
| GET | /up | none | Rails liveness check |

| POST | /api/v1/auth/register | none | body `{user:{email,password,name,time_zone}}` → 201 `{user,access_token,refresh_token,expires_in}` |
| POST | /api/v1/auth/login | none | body `{user:{email,password}}` |
| POST | /api/v1/auth/refresh | none | body `{refresh_token}`; rotates tokens |
| DELETE | /api/v1/auth/logout | none | body `{refresh_token}` → 204 |
| GET | /api/v1/me | Bearer | current user |
| PATCH | /api/v1/me | Bearer | `{user:{name,level,daily_goal_minutes,time_zone}}` |
| POST | /api/v1/me/onboarding | Bearer | `{user:{level,daily_goal_minutes,time_zone}}`; sets `onboarded` |

Auth header: `Authorization: Bearer <access_token>`. Validation errors: 422 with `details` keyed by field.

Planned endpoints are listed in the Phase 1 plan; this file is updated every milestone.

## Vocabulary (M2)
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/categories | with published `words_count` |
| GET | /api/v1/words | `?q=&category=<slug>&collection=<slug>&page=&per_page=`; published only; `{data, meta}` |
| GET | /api/v1/words/:id | adds `examples`, `collocations` |
| GET | /api/v1/collections, /collections/:slug | published collections (with ordered words) |
| GET/POST | /api/v1/favorites | POST `{type:"word", id}` is idempotent |
| DELETE | /api/v1/favorites/:type/:id | 204 |

### Admin (role `admin`, otherwise 403)
`/api/v1/admin/{categories,words,collections}`: index (`page`, `per_page`, words also `q`, `status`), show, create, update, destroy.
Words accept nested `vocabulary_examples_attributes` / `vocabulary_collocations_attributes` (`_destroy` to remove).
Collections accept `word_ids` (ordered). `POST/DELETE /admin/words/:id/audio` (multipart field `audio`).
Deleting a category that still has words returns 409.

## Learning (M3)
| Method | Path | Notes |
|---|---|---|
| POST | /api/v1/learning_sessions | returns the open session (200) or builds one (201); `{data:null, reason:"all_caught_up"}` when nothing is due. Items embed full word details. |
| GET | /api/v1/learning_sessions/:id | own sessions only |
| POST | /api/v1/learning_sessions/:id/complete | finish early; no penalty |
| POST | /api/v1/reviews | `{review:{word_id, rating: again\|hard\|good\|easy, client_request_id, session_item_id?}}`; 201, or 200 with `duplicate:true` when the id was already processed |
| GET | /api/v1/reviews/due | `{data:{due_count}}` |

## Dashboard, quiz, progress (M4)
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/dashboard | `due_count, new_available, goal_cards, backlog, can_start, open_session, reviewed_today, days_studied_this_week, words_started, vocabulary`. `vocabulary` = `{ total, unseen, learning, familiar, solid, mastered, solid_soon }`, disjoint stages by review interval (solid = 7-20 days, mastered = 21+). No streak or "missed days" fields by design. No streak or "missed days" fields by design. |
| GET | /api/v1/progress | word strength buckets (learning / young / mature ≥ 21 days), accuracy, last 14 days by local date |
| GET | /api/v1/history | paginated review history of the current user |
| GET | /api/v1/quizzes/quick | `?mode=choice\|listen\|type&count=1..10` (default `choice`, 5). `choice`: meaning among 4 options. `listen`: audio (or `speak_text` when no recording exists) and 4 spelled options. `type`: English definition, word length and first letter. No answer key in any payload. |
| POST | /api/v1/quizzes/quick/answers | `{answers:[{word_id, choice_word_id}]}` or `{answers:[{word_id, text}]}` (max 20), graded on the server. Typed answers ignore case, spaces and hyphens, accept plural/singular, and report a one-letter slip as `close`. Does not change scheduling. |

## Listening (M5)
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/listening_lessons | published lessons with `questions_count`, `best_score` (null until attempted) |
| GET | /api/v1/listening_lessons/:id | transcript EN/VI, `audio_url`, questions (`id, prompt, choices`); the answer key is never sent |
| POST | /api/v1/listening_lessons/:id/attempts | `{answers:[{question_id, choice_index}]}` → 201 `{score,total,results[{correct,correct_index,explanation}]}`; unanswered = wrong |
| * | /api/v1/admin/listening | CRUD, nested `listening_questions_attributes` (`choices` array, `correct_index`); `POST/DELETE /:id/audio` |

## Scenarios (M6)
Scripted lessons, not AI chat: a fixed dialogue the learner steps through; lines with `role: "you"` are the learner's own lines.
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/scenarios | published; `lines_count`, `last_position`, `completed` |
| GET | /api/v1/scenarios/:slug | `situation`, ordered `dialogues` (`speaker, role, text_en, text_vi, tip`) |
| POST | /api/v1/scenarios/:slug/progress | `{progress:{last_position, completed}}`; position never goes back, completion is permanent |
| * | /api/v1/admin/scenarios | CRUD with nested `scenario_dialogues_attributes` (positions must be unique) |

## Learning path and growth (R1, R2)
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/path | levels → units → steps with state (`completed`, `in_progress`, `available`, `locked`), `start_level`, `next_up`. Locks are guidance, not security: all content stays reachable. |
| GET | /api/v1/path/units/:slug | one unit with its steps |
| GET | /api/v1/path/units/:slug/quiz | up to 8 meaning questions from the unit's own words, no answer key |
| POST | /api/v1/path/units/:slug/quiz/answers | `{answers:[{word_id, choice_word_id}]}`; graded on the server, best result counts (pass at 70%, at least 4 answers); returns `xp_gained`, `units_completed`, `rank_up` |
| POST | /api/v1/learning_sessions?collection=:slug | same as before, but new words come from that collection first (used by the path's "words" step) |
| GET | /api/v1/growth | `xp`, `rank`, `next_rank`, `progress_to_next`, 119-day `calendar`, `week {active_days, target, start}`, `units_completed` |
Listening attempts, scenario progress and quiz answers also return `units_completed` when they finish a unit.

Step rules: words ≥ 80% of the collection met at least once; listening ≥ 60% on any attempt; scenario played to the end; unit quiz ≥ 70%.
Unlock rules: first unit of the learner's level is open; each next unit opens when the previous is complete; the next level opens when every unit of the previous level is complete; levels below the learner's own level are fully open.
XP (never decreases): 1 per review, 3 per word met, 15 per passed lesson, 15 per completed scenario, 50 per completed unit. Ranks: Intern 0, Junior 100, Mid 400, Senior 1000, Lead 2500.

## Work toolkit (R4)
| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/toolkit/phrases | published phrases in order; `?category=pr_feedback\|standup\|meeting\|incident\|email`; `{id, category, text_en, text_vi, audio_url}` |
| * | /api/v1/admin/phrases | CRUD and `POST/DELETE /:id/audio` |

The standup, incident and email builders run in the browser (`web/src/lib/toolkit`, covered by Vitest). They are deterministic templates, not AI:
the learner picks verbs and types the details, the builder applies the grammar (past simple for finished work, `will` + base form for plans, `cannot` for impact)
and leaves visible `[placeholders]` for anything not filled in. Output can be copied or played with the browser voice.

## Account management
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /api/v1/auth/password/forgot | none | `{ email }`. Always 204 (does not reveal whether the account exists). Emails a 30-minute single-use link. |
| POST | /api/v1/auth/password/reset | none | `{ token, password }`. 204, or 422 `invalid_token`. Signs out every session. |
| POST | /api/v1/auth/email/verify | none | `{ token }`. 204, or 422 `invalid_token`. Link valid for 3 days. |
| POST | /api/v1/me/email/resend | user | 204. |
| PATCH | /api/v1/me/password | user | `{ user: { current_password, new_password } }`. 204. Signs out every session. |
| GET | /api/v1/me/export | user | All data stored for the user as JSON. |
| DELETE | /api/v1/me | user | `{ password }`. Permanently deletes the account, including the immutable review log (see `docs/security.md`). |

`email_verified` is part of the user payload. Verification is not required to use the app; it exists so password recovery works.

## Personalization
- User fields `focus_role` (developer, qa, devops, analyst, manager, other) and `focus_goal` (daily_work, interview, docs) are set in onboarding or `PATCH /me`.
- `path_units.audiences` lists the roles/goals a unit is aimed at (empty = everyone). `GET /path` moves units aimed at someone else to the end of their level and sets `recommended: true` on units that match the learner. Nothing is hidden and unlock rules are unchanged.
- `GET /placement` returns 10 choice questions; `POST /placement/answers` `{ answers: [{ word_id, choice_word_id }] }` returns `{ score, total, results, suggested_level }` (8+ intermediate, 5+ elementary, else beginner). It does not change the profile; the client saves the level with `PATCH /me`.

## Events, reports and metrics
- `POST /events` `{ name: "app_open" }` (user): the only event the client may send; recorded at most once per user per day. All other events (`signup`, `onboarded`, `session_started`, `session_completed`, `unit_completed`, `scenario_completed`, `report_submitted`) are written by the server. Props hold ids only. Events are deleted with the account.
- `POST /reports` `{ report: { type: word|listening|scenario|phrase, id, message } }` (user): "report a mistake". Message up to 500 characters, 20 per user per day.
- Admin: `GET /admin/metrics` (users, active today/7d/30d, day-1 and day-7 return of recent signups, signup funnel, 7-day learning counts, open reports); `GET/PATCH/DELETE /admin/reports` (triage: open, resolved, dismissed).
- No third-party analytics: numbers come from our own `events` and `review_logs` tables, so no learner data leaves the database.

## Public content (no sign-in)
`GET /api/v1/public/sample` (5 random published words) and `GET /api/v1/public/words` (up to 500, cached for 1 hour). Fields: id, term, ipa, part_of_speech, meaning_vi, definition_en, first example. Drafts are never returned. Used by the landing page "Try five words", the `/glossary` page (rendered on the server for search engines) and nothing else.

## Admin content tools
- `POST /api/v1/admin/words/import` `{ csv, dry_run }`: bulk add or update words (max 500 rows, 1 MB). Returns `{ created, updated, errors: [{ row, message }], dry_run }`; a file with any error saves nothing.
- `/api/v1/admin/units` (CRUD): path units. `steps` is an array of lines (`words:slug`, `listening:id-or-title`, `scenario:slug`, `quiz`) that replaces all steps on save; `audiences` lists roles and goals.

## Learning more than the daily plan
- `POST /learning_sessions?extra=N` (N = 5, 10, 20 or 30) starts a session of N new words only, outside the daily limit and even while reviews are waiting (the learner asked for it). Can be repeated without limit. Other values are ignored and the normal daily session is built.
- New words in a session are taken one per topic in turn, so a session mixes IT and everyday English (collection-focused sessions keep the collection order).
- `users.new_words_per_day` (1–100, or null for automatic = max(daily minutes / 2, 3)) sets how many new words the daily session brings. Settable with `PATCH /me`.
- `GET /dashboard` adds `new_words_per_day` and `new_words_left` (published words the learner has not started).

## CEFR levels (A1, A2, B1, B2)
Learners (`users.level`), words (`vocabulary_words.cefr_level`), listening lessons, scenarios and path units all use `a1`, `a2`, `b1`, `b2`. The old names
beginner, elementary and intermediate are still accepted and mapped to a1, a2 and b1. `GET /words?level=b1` filters the library; words include `level`.
`GET /path` returns four levels; the next step is the first open unit at or above the learner's level (easier units stay open). New words in a session
come at or below the learner's level first. `GET /placement` asks 3 A1, 3 A2, 2 B1 and 2 B2 words; `POST /placement/answers` returns `by_level` and suggests
the highest level passed (60%) with every level below it passed too. CSV import accepts a `level` column.
