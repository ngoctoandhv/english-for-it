class ListeningSerializer
  def self.summary(lesson, best: nil)
    { id: lesson.id, title: lesson.title, description: lesson.description, level: lesson.level,
      duration_seconds: lesson.duration_seconds, audio_url: AudioUrl.call(lesson.audio),
      questions_count: lesson.listening_questions.size, best_score: best }
  end

  # Learner view: never includes the answer key.
  def self.detail(lesson, best: nil)
    summary(lesson, best: best).merge(
      transcript_en: lesson.transcript_en, transcript_vi: lesson.transcript_vi,
      questions: lesson.listening_questions.map { |q| { id: q.id, prompt: q.prompt, choices: q.choices } }
    )
  end

  def self.admin(lesson)
    summary(lesson).merge(
      status: lesson.status, position: lesson.position, transcript_en: lesson.transcript_en, transcript_vi: lesson.transcript_vi,
      questions: lesson.listening_questions.map { |q| { id: q.id, prompt: q.prompt, choices: q.choices, correct_index: q.correct_index, explanation: q.explanation, position: q.position } }
    )
  end
end
