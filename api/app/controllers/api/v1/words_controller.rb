module Api
  module V1
    class WordsController < BaseController
      include Authenticatable

      def index
        scope = VocabularyWord.published.includes(:vocabulary_category, audio_attachment: :blob).order(:term)
        scope = scope.joins(:vocabulary_category).where(vocabulary_categories: { slug: params[:category] }) if params[:category].present?
        if params[:collection].present?
          scope = scope.joins(collection_words: :learning_collection)
                       .where(learning_collections: { slug: params[:collection], status: "published" })
                       .reorder("collection_words.position")
        end
        scope = scope.search(params[:q])
        page, per = page_params
        total = scope.count
        words = scope.offset((page - 1) * per).limit(per).to_a
        favorites = favorite_ids(words)
        render json: { data: words.map { |w| VocabularySerializer.summary(w, favorite_ids: favorites) },
                       meta: page_meta(page, per, total) }
      end

      def show
        word = VocabularyWord.published.includes(:vocabulary_category, :vocabulary_examples, :vocabulary_collocations, audio_attachment: :blob).find(params[:id])
        render json: { data: VocabularySerializer.detail(word, favorite_ids: favorite_ids([ word ])) }
      end

      private

      def favorite_ids(words)
        current_user.user_favorites.where(favoritable_type: "VocabularyWord", favoritable_id: words.map(&:id)).pluck(:favoritable_id)
      end
    end
  end
end
