module Api
  module V1
    # Read-only, signed-out content for the landing page, the glossary and search engines. Published words only.
    class PublicController < BaseController
      SAMPLE_SIZE = 5

      def sample
        words = scope.order(Arel.sql("RANDOM()")).limit(SAMPLE_SIZE)
        expires_in 5.minutes, public: true
        render json: { data: words.map { |w| payload(w) } }
      end

      def words
        expires_in 1.hour, public: true
        render json: { data: scope.order(:term).limit(500).map { |w| payload(w) } }
      end

      private

      def scope = VocabularyWord.published.includes(:vocabulary_examples)

      def payload(word)
        example = word.vocabulary_examples.min_by { |e| [ e.position.to_i, e.id ] }
        { id: word.id, term: word.term, ipa: word.ipa, part_of_speech: word.part_of_speech, meaning_vi: word.meaning_vi,
          definition_en: word.definition_en, example: example && { en: example.sentence_en, vi: example.translation_vi } }
      end
    end
  end
end
