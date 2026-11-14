module Api
  module V1
    class PathController < BaseController
      include Authenticatable

      def index
        Path::Completions.sync!(current_user)
        render json: { data: Path::Overview.new(current_user).call }
      end

      def show
        overview = Path::Overview.new(current_user).call
        unit = overview[:levels].flat_map { |l| l[:units] }.find { |u| u[:slug] == params[:id] }
        raise ActiveRecord::RecordNotFound unless unit

        render json: { data: unit }
      end

      def quiz
        unit = PathUnit.published.find_by!(slug: params[:id])
        render json: { data: { questions: Path::UnitQuiz.build(unit) } }
      end

      MAX_ANSWERS = 20

      def answers
        unit = PathUnit.published.find_by!(slug: params[:id])
        raw = params.expect(answers: [ %i[word_id choice_word_id] ])
        return render_error("validation_failed", "Too many answers", :unprocessable_content) if raw.size > MAX_ANSWERS

        render json: { data: Path::UnitQuiz.grade!(current_user, unit, raw.map(&:to_h).map(&:symbolize_keys)) }
      end
    end
  end
end
