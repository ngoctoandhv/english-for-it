module LearningSessions
  # Returns the user's open session, or builds a new one. Returns nil when there is nothing to study.
  class Start
    def self.call(user, now: Time.current, collection: nil) = new(user, now, collection).call

    def initialize(user, now, collection = nil)
      @user = user
      @now = now
      @collection = collection
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
      fresh = VocabularyWord.published.where.not(id: @user.user_word_progresses.select(:vocabulary_word_id))
      # Focus on one collection (from the learning path): its words first, in the collection's own order.
      fresh = fresh.joins(:collection_words).where(collection_words: { learning_collection_id: @collection.id }).reorder("collection_words.position") if @collection
      new_ids = (@collection ? fresh : fresh.order(:id)).limit(@plan.new_slots(reviews.size)).pluck(:id)
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
