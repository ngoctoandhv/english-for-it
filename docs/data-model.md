# Data model

Source of truth: `api/db/schema.rb`. Timestamps are UTC.

## M1
- `users`: email (unique on lower(email)), password_digest, name, role (user|admin), level, daily_goal_minutes (5|10|15),
  time_zone (IANA), onboarded_at.
- `refresh_tokens`: user_id (FK), token_digest (unique), expires_at, revoked_at, user_agent.
