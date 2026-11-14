module Api
  module V1
    class CollectionsController < BaseController
      include Authenticatable

      def index
        counts = CollectionWord.joins(:vocabulary_word).merge(VocabularyWord.published).group(:learning_collection_id).count
        data = LearningCollection.published.ordered.map { |c| summary(c, counts.fetch(c.id, 0)) }
        render json: { data: data }
      end

      def show
        collection = LearningCollection.published.find_by!(slug: params[:id])
        words = collection.vocabulary_words.published.includes(:vocabulary_category, audio_attachment: :blob).reorder("collection_words.position")
        render json: { data: summary(collection, words.size).merge(words: words.map { |w| VocabularySerializer.summary(w) }) }
      end

      private

      def summary(c, count) = { id: c.id, title: c.title, slug: c.slug, description: c.description, words_count: count }
    end
  end
end
