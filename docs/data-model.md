# Data model

Source of truth: `api/db/schema.rb`. Timestamps are UTC.

## M1
- `users`: email (unique on lower(email)), password_digest, name, role (user|admin), level, daily_goal_minutes (5|10|15),
  time_zone (IANA), onboarded_at.
- `refresh_tokens`: user_id (FK), token_digest (unique), expires_at, revoked_at, user_agent.

## M2 (vocabulary)
- `vocabulary_categories` (slug unique), `vocabulary_words` (unique on lower(term)+part_of_speech; status draft|reviewed|published;
  FK category `restrict`), `vocabulary_examples`, `vocabulary_collocations` (cascade from word),
  `learning_collections` (slug unique, status) + `collection_words` (unique per collection/word, `position`),
  `user_favorites` (polymorphic, unique per user/type/id, FK cascade from user).
- Audio: Active Storage attachment `audio` on words (audio/* only, ≤ 5 MB).
- Learners only see `published` content.

## M3 (learning)
- `user_word_progresses`: unique (user, word); state learning|review, due_at, interval_days, ease, reps, lapses; index (user, due_at).
- `learning_sessions` (partial unique index: one `in_progress` per user), `learning_session_items` (unique position and word per session).
- `review_logs`: append-only (trigger), unique (user, client_request_id), `state_before`/`state_after` jsonb, rating check constraint.
- Schema is dumped to `api/db/structure.sql`.
