module Api
  module V1
    module Admin
      class VocabularyCategoriesController < ResourcesController
        private

        def model = VocabularyCategory
        def index_scope = VocabularyCategory.ordered
        def permitted = params.expect(category: [ :name, :slug, :position ])
        def serialize(c) = { id: c.id, name: c.name, slug: c.slug, position: c.position }
      end
    end
  end
end
