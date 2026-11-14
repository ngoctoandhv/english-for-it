class LearningSessionSerializer
  def self.call(session)
    items = session.learning_session_items.includes(vocabulary_word: [ :vocabulary_category, :vocabulary_collocations, { vocabulary_examples: { audio_attachment: :blob } }, { audio_attachment: :blob } ]).to_a
    {
      id: session.id, status: session.status, session_date: session.session_date, completed_at: session.completed_at,
      total_items: items.size, completed_items: items.count(&:completed?),
      items: items.map do |i|
        { id: i.id, kind: i.kind, position: i.position, completed: i.completed?, word: VocabularySerializer.detail(i.vocabulary_word) }
      end
    }
  end

  def self.progress(session)
    return nil unless session

    { id: session.id, status: session.status, total_items: session.learning_session_items.count,
      completed_items: session.learning_session_items.where.not(completed_at: nil).count }
  end
end
