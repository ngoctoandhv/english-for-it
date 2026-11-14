module LearningSessions
  # Returns the user's open session, or builds a new one. Returns nil when there is nothing to study.
  class Start
    EXTRA_SIZES = [ 5, 10, 20, 30 ].freeze

    # extra: a session of that many new words only, outside the daily limit (the learner asked for more).
    def self.call(user, now: Time.current, collection: nil, extra: nil) = new(user, now, collection, extra).call

    def initialize(user, now, collection = nil, extra = nil)
      @user = user
      @now = now
      @collection = collection
      @extra = EXTRA_SIZES.include?(extra.to_i) ? extra.to_i : nil
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

    # Words above the learner's CEFR level come after the words at or below it (they are never hidden).
    def level_penalty_sql
      allowed = Cefr::LEVELS.first(Cefr.rank(@user.level || "a2") + 1).map { |l| ActiveRecord::Base.connection.quote(l) }.join(", ")
      "CASE WHEN cefr_level IS NULL OR cefr_level IN (#{allowed}) THEN 0 ELSE 1 END"
    end

    # Takes one word from each topic in turn (IT, small talk, polite requests...), so every session mixes work and everyday English.
    def mixed_topics(scope, limit)
      return [] if limit <= 0

      ranked = scope.select("vocabulary_words.id, vocabulary_words.vocabulary_category_id, vocabulary_words.cefr_level, " \
                            "ROW_NUMBER() OVER (PARTITION BY vocabulary_words.vocabulary_category_id ORDER BY vocabulary_words.id) AS topic_rank")
      VocabularyWord.from(ranked, :vocabulary_words).order(Arel.sql("#{level_penalty_sql}, topic_rank, vocabulary_category_id")).limit(limit).pluck(:id)
    end

    def build
      reviews = @extra ? [] : @plan.due_scope.order(:due_at).limit(@plan.goal_cards).pluck(:vocabulary_word_id)
      fresh = VocabularyWord.published.where.not(id: @user.user_word_progresses.select(:vocabulary_word_id))
      # Focus on one collection (from the learning path): its words first, in the collection's own order.
      fresh = fresh.joins(:collection_words).where(collection_words: { learning_collection_id: @collection.id }).reorder("collection_words.position") if @collection
      limit = @extra || @plan.new_slots(reviews.size)
      new_ids = @collection ? fresh.limit(limit).pluck(:id) : mixed_topics(fresh, limit)
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
