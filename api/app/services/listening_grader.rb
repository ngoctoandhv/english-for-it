# Grades a listening attempt on the server. Unanswered questions count as wrong.
class ListeningGrader
  Result = Struct.new(:score, :total, :results, keyword_init: true)

  def self.call(lesson, answers)
    chosen = answers.to_h { |a| [ a[:question_id].to_i, a[:choice_index] ] }
    results = lesson.listening_questions.map do |q|
      choice = chosen[q.id]
      { question_id: q.id, correct: !choice.nil? && choice.to_i == q.correct_index && choice.to_s.match?(/\A\d+\z/),
        choice_index: choice.nil? ? nil : choice.to_i, correct_index: q.correct_index, explanation: q.explanation }
    end
    Result.new(score: results.count { |r| r[:correct] }, total: results.size, results: results)
  end
end
