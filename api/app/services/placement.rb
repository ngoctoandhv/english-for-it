# A short vocabulary check that suggests a starting level. It samples published words, so it measures IT vocabulary,
# not general English; the learner can always pick a level by hand. Stateless: answers are graded by Quizzes::Quick.
class Placement
  QUESTIONS = 10
  # score out of QUESTIONS -> suggested level
  THRESHOLDS = { "intermediate" => 8, "elementary" => 5, "beginner" => 0 }.freeze

  def self.questions(user)
    pool = VocabularyWord.published
    unseen = pool.where.not(id: user.user_word_progresses.select(:vocabulary_word_id))
    source = unseen.count >= QUESTIONS ? unseen : pool
    ids = source.order(Arel.sql("RANDOM()")).limit(QUESTIONS).pluck(:id)
    ids.map { |id| Quizzes::Quick.choice_question(pool, VocabularyWord.find(id)) }.shuffle
  end

  def self.grade(answers)
    graded = Quizzes::Quick.grade(answers)
    score = graded[:score]
    level = THRESHOLDS.find { |_, min| score >= min }.first
    graded.merge(suggested_level: level)
  end
end
