module Api
  module V1
    module Admin
      class ToolkitPhrasesController < ResourcesController
        private

        def model = ToolkitPhrase
        def index_scope = ToolkitPhrase.order(:category, :position, :id).includes(audio_attachment: :blob)
        def permitted = params.expect(phrase: [ :category, :text_en, :text_vi, :position, :status ])

        def serialize(p)
          { id: p.id, category: p.category, text_en: p.text_en, text_vi: p.text_vi, position: p.position, status: p.status, audio_url: AudioUrl.call(p.audio) }
        end
      end
    end
  end
end
