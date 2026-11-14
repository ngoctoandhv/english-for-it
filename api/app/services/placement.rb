# A short vocabulary check that suggests a CEFR starting level (A1-B2). It asks about words from each level
# (3 x A1, 3 x A2, 2 x B1, 2 x B2) and suggests the highest level the learner passes, with every level below it passed too.
# It measures vocabulary only, so it is a suggestion; the learner can always choose a level by hand. Stateless.
class Placement
  PER_LEVEL = { "a1" => 3, "a2" => 3, "b1" => 2, "b2" => 2 }.freeze
  PASS_RATE = 0.6

  def self.questions(user)
    pool = VocabularyWord.published
    seen = user.user_word_progresses.select(:vocabulary_word_id)
    PER_LEVEL.flat_map do |level, n|
      at_level = pool.where(cefr_level: level)
      source = at_level.where.not(id: seen).count >= n ? at_level.where.not(id: seen) : at_level
      source.order(Arel.sql("RANDOM()")).limit(n).map { |w| Quizzes::Quick.choice_question(pool, w).merge(level: level) }
    end
  end

  def self.grade(answers)
    graded = Quizzes::Quick.grade(answers)
    levels = VocabularyWord.where(id: graded[:results].map { |r| r[:word_id] }).pluck(:id, :cefr_level).to_h
    by_level = Cefr::LEVELS.to_h do |level|
      rs = graded[:results].select { |r| levels[r[:word_id]] == level }
      [ level, { correct: rs.count { |r| r[:correct] }, total: rs.size } ]
    end
    suggested = "a1"
    Cefr::LEVELS.each do |level|
      s = by_level[level]
      break if s[:total].zero? || s[:correct] < (s[:total] * PASS_RATE).ceil

      suggested = level
    end
    graded.merge(by_level: by_level, suggested_level: suggested)
  end
end
