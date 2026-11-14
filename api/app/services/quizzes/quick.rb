module Quizzes
  # Stateless multiple-choice quiz: "which Vietnamese meaning matches this word?". The answer is checked on the
  # server by comparing the chosen word id with the question's word id. Quizzes never change the review schedule.
  class Quick
    OPTIONS = 4

    def self.build(user, count: 5)
      pool = VocabularyWord.published
      return [] if pool.count < OPTIONS

      started = pool.where(id: user.user_word_progresses.select(:vocabulary_word_id)).order(Arel.sql("RANDOM()")).limit(count).to_a
      filler = pool.where.not(id: started.map(&:id)).order(Arel.sql("RANDOM()")).limit(count - started.size).to_a
      (started + filler).map { |word| question(pool, word) }
    end

    def self.question(pool, word)
      same = pool.where(part_of_speech: word.part_of_speech).where.not(id: word.id).order(Arel.sql("RANDOM()")).limit(OPTIONS - 1).to_a
      others = same.size < OPTIONS - 1 ? pool.where.not(id: [ word.id ] + same.map(&:id)).order(Arel.sql("RANDOM()")).limit(OPTIONS - 1 - same.size).to_a : []
      options = ([ word ] + same + others).shuffle.map { |w| { word_id: w.id, meaning_vi: w.meaning_vi } }
      { word_id: word.id, term: word.term, ipa: word.ipa, part_of_speech: word.part_of_speech, options: options }
    end

    def self.grade(answers)
      ids = answers.map { |a| a[:word_id].to_i }
      words = VocabularyWord.published.where(id: ids).index_by(&:id)
      results = answers.map do |a|
        word = words[a[:word_id].to_i]
        next nil unless word

        { word_id: word.id, correct: a[:choice_word_id].to_i == word.id, correct_meaning_vi: word.meaning_vi }
      end.compact
      { score: results.count { |r| r[:correct] }, total: results.size, results: results }
    end
  end
end
