module Api
  module V1
    class QuizzesController < BaseController
      include Authenticatable

      def quick
        count = params[:count].to_i.clamp(1, 10)
        count = 5 if params[:count].blank?
        render json: { data: { questions: Quizzes::Quick.build(current_user, count: count) } }
      end

      MAX_ANSWERS = 20

      def answers
        raw = params.expect(answers: [ %i[word_id choice_word_id] ])
        return render_error("validation_failed", "Too many answers", :unprocessable_content) if raw.size > MAX_ANSWERS

        render json: { data: Quizzes::Quick.grade(raw.map(&:to_h).map(&:symbolize_keys)) }
      end
    end
  end
end
