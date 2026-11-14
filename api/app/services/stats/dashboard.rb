module Stats
  class Dashboard
    def initialize(user, now: Time.current)
      @user = user
      @now = now
      @plan = LearningSessions::Plan.new(user, now: now)
    end

    def call
      open = @user.learning_sessions.find_by(status: "in_progress")
      due = @plan.due_count
      new_slots = @plan.new_slots([ due, @plan.goal_cards ].min)
      week = DailyCounts.call(@user, days: 7, now: @now)
      {
        due_count: due,
        new_available: new_slots,
        goal_cards: @plan.goal_cards,
        backlog: @plan.backlog?,
        can_start: open.present? || due.positive? || new_slots.positive?,
        open_session: LearningSessionSerializer.progress(open),
        reviewed_today: week.last[:reviews],
        days_studied_this_week: week.count { |d| d[:reviews].positive? },
        vocabulary: Vocabulary.new(@user).call,
        words_started: @user.user_word_progresses.count,
        favorites_count: @user.user_favorites.count
      }
    end
  end
end
