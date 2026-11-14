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
