module Path
  # End-of-unit quiz built from the unit's own words. Graded on the server; the best result counts.
  class UnitQuiz
    QUESTIONS = 8
    MIN_WORDS = 4

    def self.build(unit)
      ids = unit.collection_word_ids
      return [] if ids.size < MIN_WORDS

      pool = VocabularyWord.published
      VocabularyWord.published.where(id: ids).order(Arel.sql("RANDOM()")).limit(QUESTIONS).map { |w| Quizzes::Quick.choice_question(pool, w) }
    end

    # answers: [{word_id:, choice_word_id:}]; only the unit's own words are graded.
    def self.grade!(user, unit, answers)
      allowed = unit.collection_word_ids.to_set
      graded = Quizzes::Quick.grade(answers.select { |a| allowed.include?(a[:word_id].to_i) })
      return graded.merge(saved: false) if graded[:total] < MIN_WORDS

      before = Growth::Xp.new(user).call
      user.unit_quiz_results.create!(path_unit: unit, score: graded[:score], total: graded[:total], created_at: Time.current)
      newly = Completions.sync!(user)
      after = Growth::Xp.new(user).call
      graded.merge(saved: true, passed: graded[:score].to_f / graded[:total] >= Progress::QUIZ_RATIO,
                   units_completed: newly.map { |u| { slug: u.slug, title: u.title } },
                   xp_gained: after[:xp] - before[:xp], rank_up: after[:rank][:index] > before[:rank][:index] ? after[:rank] : nil)
    end
  end
end
