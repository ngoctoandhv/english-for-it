module Api
  module V1
    module Admin
      class VocabularyWordsController < ResourcesController
        private

        def model = VocabularyWord

        def index_scope
          scope = VocabularyWord.includes(:vocabulary_category, :vocabulary_collocations, vocabulary_examples: { audio_attachment: :blob }, audio_attachment: :blob).order(:term)
          scope = scope.where(status: params[:status]) if params[:status].present?
          scope.search(params[:q])
        end

        def permitted
          params.expect(word: [
            :term, :ipa, :part_of_speech, :meaning_vi, :definition_en, :status, :vocabulary_category_id, :cefr_level,
            { vocabulary_examples_attributes: [ %i[id sentence_en translation_vi position _destroy] ],
              vocabulary_collocations_attributes: [ %i[id phrase translation_vi _destroy] ] }
          ])
        end

        def serialize(w) = VocabularySerializer.admin(w)
      end
    end
  end
end
