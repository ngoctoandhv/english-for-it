module LearningSessions
  # What a user can study right now. Shared by session building and the dashboard.
  # No-guilt rules: overdue cards are never lost or penalised; they are spread over sessions (capped by the daily
  # goal) and new words pause while a backlog exists.
  class Plan
    CARDS_PER_MINUTE = 2

    def initialize(user, now: Time.current)
      @user = user
      @now = now
    end

    def goal_cards = @user.daily_goal_minutes * CARDS_PER_MINUTE
    def new_words_per_day = [ @user.daily_goal_minutes / 2, 3 ].max
    def day_end = @now.in_time_zone(@user.time_zone).end_of_day
    def day_start = @now.in_time_zone(@user.time_zone).beginning_of_day

    def due_scope = @user.user_word_progresses.joins(:vocabulary_word).merge(VocabularyWord.published).where(due_at: ..day_end)
    def due_count = @due_count ||= due_scope.count
    def backlog? = due_count > goal_cards

    def new_started_today
      LearningSessionItem.joins(:learning_session)
                         .where(learning_sessions: { user_id: @user.id }, kind: "new", created_at: day_start..day_end).count
    end

    def new_allowed = backlog? ? 0 : [ new_words_per_day - new_started_today, 0 ].max

    def new_available_count
      VocabularyWord.published.where.not(id: @user.user_word_progresses.select(:vocabulary_word_id)).count
    end

    def new_slots(review_count)
      [ new_allowed, goal_cards - review_count, new_available_count ].min.clamp(0, 1000)
    end
  end
end
