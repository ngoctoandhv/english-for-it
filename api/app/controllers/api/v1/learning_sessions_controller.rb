module Api
  module V1
    class LearningSessionsController < BaseController
      include Authenticatable

      # POST: returns the open session or builds one; 200 with `data: null` when there is nothing to study.
      def create
        session = LearningSessions::Start.call(current_user)
        if session
          render json: { data: LearningSessionSerializer.call(session) }, status: session.previously_new_record? ? :created : :ok
        else
          render json: { data: nil, reason: "all_caught_up" }
        end
      end

      def show
        render json: { data: LearningSessionSerializer.call(current_user.learning_sessions.find(params[:id])) }
      end

      def complete
        session = current_user.learning_sessions.find(params[:id])
        session.complete!
        render json: { data: LearningSessionSerializer.progress(session) }
      end
    end
  end
end
