module Reviews
  # Records one review atomically. Idempotent per (user, client_request_id): resubmitting returns the original
  # outcome without writing again.
  class Submit
    class InvalidItem < StandardError; end

    Result = Struct.new(:log, :progress, :session, :duplicate, keyword_init: true)

    def self.call(**args) = new(**args).call

    def initialize(user:, word_id:, rating:, client_request_id:, session_item_id: nil, now: Time.current,
                   scheduler: Scheduling.algorithm)
      @user = user
      @word_id = word_id
      @rating = rating.to_s
      @request_id = client_request_id.to_s
      @item_id = session_item_id
      @now = now
      @scheduler = scheduler
    end

    def call
      existing = find_existing
      return existing if existing

      perform
    rescue ActiveRecord::RecordNotUnique
      find_existing || raise
    end

    private

    def find_existing
      log = @user.review_logs.find_by(client_request_id: @request_id)
      return nil unless log

      progress = @user.user_word_progresses.find_by(vocabulary_word_id: log.vocabulary_word_id)
      Result.new(log: log, progress: progress, session: log.learning_session_item&.learning_session, duplicate: true)
    end

    def perform
      word = VocabularyWord.published.find(@word_id)
      ReviewLog.transaction do
        item = find_item(word)
        progress = lock_progress(word)
        before = progress.to_state
        after = @scheduler.call(before, @rating, now: @now)

        log = @user.review_logs.create!(
          vocabulary_word: word, learning_session_item: item, rating: @rating, client_request_id: @request_id,
          reviewed_at: @now, state_before: before.to_h_for_log, state_after: after.to_h_for_log
        )
        progress.apply!(after, reviewed_at: @now)
        item&.update!(completed_at: @now) unless item&.completed?
        item&.learning_session&.finish_if_done!
        Result.new(log: log, progress: progress, session: item&.learning_session, duplicate: false)
      end
    end

    def find_item(word)
      return nil if @item_id.blank?

      item = LearningSessionItem.joins(:learning_session)
                                .where(learning_sessions: { user_id: @user.id }).find_by(id: @item_id)
      raise InvalidItem, "session item not found" unless item && item.vocabulary_word_id == word.id

      item
    end

    def lock_progress(word)
      attrs = { user: @user, vocabulary_word: word }
      progress = UserWordProgress.lock.find_by(attrs)
      return progress if progress

      fresh = Scheduling.new_state(now: @now)
      UserWordProgress.create!(attrs.merge(state: fresh.state, due_at: fresh.due_at, ease: fresh.ease))
    end
  end
end
