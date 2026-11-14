module Api
  module V1
    class CategoriesController < BaseController
      include Authenticatable

      def index
        counts = VocabularyWord.published.group(:vocabulary_category_id).count
        data = VocabularyCategory.ordered.map do |c|
          { id: c.id, name: c.name, slug: c.slug, words_count: counts.fetch(c.id, 0) }
        end
        render json: { data: data }
      end
    end
  end
end
