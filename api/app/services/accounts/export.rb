module Accounts
  # Everything the platform stores about a user, as plain data they can keep (GDPR-style export).
  class Export
    def self.call(user)
      {
        exported_at: Time.current.iso8601,
        account: UserSerializer.call(user),
        favorites: user.user_favorites.map { |f| { type: f.favoritable_type, id: f.favoritable_id, at: f.created_at } },
        word_progress: user.user_word_progresses.includes(:vocabulary_word).map do |p|
          { word: p.vocabulary_word.term, state: p.state, interval_days: p.interval_days, reps: p.reps, lapses: p.lapses, due_at: p.due_at }
        end,
        reviews: user.review_logs.includes(:vocabulary_word).order(:reviewed_at).map do |r|
          { word: r.vocabulary_word.term, rating: r.rating, reviewed_at: r.reviewed_at }
        end,
        listening_attempts: user.listening_attempts.map { |a| a.attributes.slice("listening_lesson_id", "score", "total", "created_at") },
        scenarios: user.scenario_progresses.map { |s| s.attributes.slice("it_scenario_id", "last_position", "completed_at", "updated_at") },
        unit_completions: user.unit_completions.map { |c| c.attributes.slice("path_unit_id", "created_at") }
      }
    end
  end
end
