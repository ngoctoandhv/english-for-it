# ADR 003 – Review scheduling and sessions
- `Scheduling::Simple` (ease-based, SM-2 flavoured) is a pure function `call(state, rating, now:) -> State`; parameters
  live in `api/config/scheduling.yml`. `Scheduling.algorithm` is the single place to swap in SM-2 proper or FSRS.
- A review (`Reviews::Submit`) runs in one transaction: lock progress row, compute next state, append `ReviewLog`
  (with before/after snapshots), update progress, complete the session item. Idempotent per `(user, client_request_id)`
  (unique index); the client keeps the same id while retrying a card.
- `review_logs` is immutable: `readonly?` in Ruby and a Postgres trigger rejecting UPDATE/DELETE. Because of the trigger the
  schema is dumped as `db/structure.sql` (pg_dump 17 is installed in the API image).
- No-guilt rules (`LearningSessions::Plan`): a session holds at most `daily_goal_minutes * 2` cards; overdue cards are never
  dropped or penalised, they are served over several sessions; new words pause while due cards exceed the session size;
  at most `max(goal/2, 3)` new words per local day. One open session per user (partial unique index).
- Session items are word cards only (kind `new` | `review`). Listening and scenarios are separate flows (M5, M6).
