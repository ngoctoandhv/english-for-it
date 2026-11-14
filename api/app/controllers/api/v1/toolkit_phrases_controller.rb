module Api
  module V1
    class ToolkitPhrasesController < BaseController
      include Authenticatable

      def index
        scope = ToolkitPhrase.published.ordered.includes(audio_attachment: :blob)
        scope = scope.where(category: params[:category]) if ToolkitPhrase::CATEGORIES.include?(params[:category])
        render json: { data: scope.map { |p| serialize(p) } }
      end

      private

      def serialize(p) = { id: p.id, category: p.category, text_en: p.text_en, text_vi: p.text_vi, audio_url: AudioUrl.call(p.audio) }
    end
  end
end
