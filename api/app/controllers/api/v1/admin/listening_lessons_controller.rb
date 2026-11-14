module Api
  module V1
    module Admin
      class ListeningLessonsController < ResourcesController
        private

        def model = ListeningLesson
        def index_scope = ListeningLesson.ordered.includes(:listening_questions, audio_attachment: :blob)

        def permitted
          params.expect(listening: [
            :title, :description, :level, :transcript_en, :transcript_vi, :duration_seconds, :position, :status,
            { listening_questions_attributes: [ [ :id, :prompt, :correct_index, :explanation, :position, :_destroy, { choices: [] } ] ] }
          ])
        end

        def serialize(l) = ListeningSerializer.admin(l)
      end
    end
  end
end
