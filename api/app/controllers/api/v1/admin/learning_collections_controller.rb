module Api
  module V1
    module Admin
      class LearningCollectionsController < ResourcesController
        private

        def model = LearningCollection
        def index_scope = LearningCollection.ordered
        def permitted = params.expect(collection: [ :title, :slug, :description, :status, :position ])

        def after_save(record)
          record.replace_words!(params.dig(:collection, :word_ids)) if params.dig(:collection, :word_ids)
        end

        def serialize(c)
          { id: c.id, title: c.title, slug: c.slug, description: c.description, status: c.status, position: c.position,
            word_ids: c.collection_words.map(&:vocabulary_word_id) }
        end
      end
    end
  end
end
