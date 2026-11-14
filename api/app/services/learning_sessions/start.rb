module LearningSessions
  # Returns the user's open session, or builds a new one. Returns nil when there is nothing to study.
  class Start
    def self.call(user, now: Time.current) = new(user, now).call

    def initialize(user, now)
      @user = user
      @now = now
      @plan = Plan.new(user, now: now)
    end

    def call
      open = @user.learning_sessions.find_by(status: "in_progress")
      return open if open

      build
    rescue ActiveRecord::RecordNotUnique
      @user.learning_sessions.find_by!(status: "in_progress")
    end

    private

    def build
      reviews = @plan.due_scope.order(:due_at).limit(@plan.goal_cards).pluck(:vocabulary_word_id)
      new_ids = VocabularyWord.published
                              .where.not(id: @user.user_word_progresses.select(:vocabulary_word_id))
                              .order(:id).limit(@plan.new_slots(reviews.size)).pluck(:id)
      return nil if reviews.empty? && new_ids.empty?

      LearningSession.transaction do
        session = @user.learning_sessions.create!(session_date: @user.local_today(@now))
        (reviews.map { |id| [ id, "review" ] } + new_ids.map { |id| [ id, "new" ] }).each_with_index do |(word_id, kind), i|
          session.learning_session_items.create!(vocabulary_word_id: word_id, kind: kind, position: i)
        end
        session
      end
    end
  end
end
