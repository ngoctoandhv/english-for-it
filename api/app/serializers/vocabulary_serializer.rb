class VocabularySerializer
  def self.summary(word, favorite_ids: [])
    {
      id: word.id, term: word.term, ipa: word.ipa, part_of_speech: word.part_of_speech,
      meaning_vi: word.meaning_vi, definition_en: word.definition_en,
      audio_url: AudioUrl.call(word.audio),
      category: word.vocabulary_category && { id: word.vocabulary_category.id, name: word.vocabulary_category.name, slug: word.vocabulary_category.slug },
      favorited: favorite_ids.include?(word.id)
    }
  end

  def self.detail(word, favorite_ids: [])
    summary(word, favorite_ids: favorite_ids).merge(
      examples: word.vocabulary_examples.map { |e| { id: e.id, sentence_en: e.sentence_en, translation_vi: e.translation_vi, audio_url: AudioUrl.call(e.audio) } },
      collocations: word.vocabulary_collocations.map { |c| { id: c.id, phrase: c.phrase, translation_vi: c.translation_vi } }
    )
  end

  def self.admin(word)
    detail(word).merge(status: word.status, vocabulary_category_id: word.vocabulary_category_id)
  end
end
