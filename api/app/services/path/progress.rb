module Path
  # What a learner has done, read from facts that never go away (review logs, attempts, completed scenarios, quiz results).
  class Progress
    WORDS_RATIO = 0.8
    LISTENING_RATIO = 0.6
    QUIZ_RATIO = 0.7

    attr_reader :learned_word_ids

    def initialize(user)
      @user = user
      @learned_word_ids = user.review_logs.distinct.pluck(:vocabulary_word_id).to_set
      @listening = best_ratio(user.listening_attempts.pluck(:listening_lesson_id, :score, :total))
      @scenarios = user.scenario_progresses.where.not(completed_at: nil).pluck(:it_scenario_id).to_set
      @quizzes = best_ratio(user.unit_quiz_results.pluck(:path_unit_id, :score, :total))
      @collection_words = Hash.new { |h, k| h[k] = [] }
    end

    def preload(units)
      ids = units.flat_map { |u| u.path_steps.select { |s| s.kind == "words" }.map(&:learning_collection_id) }.uniq
      CollectionWord.joins(:vocabulary_word).merge(VocabularyWord.published)
                    .where(learning_collection_id: ids).pluck(:learning_collection_id, :vocabulary_word_id)
                    .each { |cid, wid| @collection_words[cid] << wid }
      self
    end

    # => { done:, total:, complete: }
    def step(step, unit)
      case step.kind
      when "words"
        words = @collection_words[step.learning_collection_id]
        done = words.count { |id| @learned_word_ids.include?(id) }
        { done: done, total: words.size, complete: words.empty? || done >= (words.size * WORDS_RATIO).ceil }
      when "listening"
        ok = @listening.fetch(step.listening_lesson_id, 0) >= LISTENING_RATIO
        { done: ok ? 1 : 0, total: 1, complete: ok }
      when "scenario"
        ok = @scenarios.include?(step.it_scenario_id)
        { done: ok ? 1 : 0, total: 1, complete: ok }
      else
        ok = @quizzes.fetch(unit.id, 0) >= QUIZ_RATIO
        { done: ok ? 1 : 0, total: 1, complete: ok }
      end
    end

    def unit_complete?(unit)
      steps = unit.live_steps
      steps.any? && steps.all? { |s| step(s, unit)[:complete] }
    end

    def listening_passed_count = @listening.count { |_, ratio| ratio >= LISTENING_RATIO }
    def scenarios_completed_count = @scenarios.size

    private

    def best_ratio(rows)
      rows.each_with_object({}) do |(id, score, total), best|
        ratio = total.to_i.zero? ? 0.0 : score.to_f / total
        best[id] = [ best[id] || 0.0, ratio ].max
      end
    end
  end
end
