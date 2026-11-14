# API

Base path `/api/v1`, JSON only. Errors: `{ "error": { "code", "message", "details" } }`.

## Implemented
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/v1/health | none | `{ status, database, redis }` |
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
| GET | /api/v1/dashboard | `due_count, new_available, goal_cards, backlog, can_start, open_session, reviewed_today, days_studied_this_week, words_started`. No streak or "missed days" fields by design. |
| GET | /api/v1/progress | word strength buckets (learning / young / mature ≥ 21 days), accuracy, last 14 days by local date |
| GET | /api/v1/history | paginated review history of the current user |
| GET | /api/v1/quizzes/quick | `?count=1..10` (default 5); multiple-choice, 4 options, no answer key in the payload |
| POST | /api/v1/quizzes/quick/answers | `{answers:[{word_id, choice_word_id}]}` (max 20) graded on the server; does not change scheduling |
