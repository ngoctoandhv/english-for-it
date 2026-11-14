module Api
  module V1
    class PlacementController < BaseController
      include Authenticatable

      def show
        render json: { data: { questions: Placement.questions(current_user) } }
      end

      def answers
        answers = params.expect(answers: [ %i[word_id choice_word_id] ]).map(&:to_h).map(&:symbolize_keys)
        render json: { data: Placement.grade(answers) }
      end
    end
  end
end
