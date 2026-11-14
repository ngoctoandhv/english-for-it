module Api
  module V1
    class ReviewsController < BaseController
      include Authenticatable

      def create
        attrs = params.expect(review: [ :word_id, :rating, :client_request_id, :session_item_id ])
        unless Scheduling::RATINGS.include?(attrs[:rating])
          return render_error("validation_failed", "Validation failed", :unprocessable_content, { rating: [ "is not included in the list" ] })
        end

        result = Reviews::Submit.call(user: current_user, word_id: attrs[:word_id], rating: attrs[:rating],
                                      client_request_id: attrs[:client_request_id], session_item_id: attrs[:session_item_id])
        Path::Completions.sync!(current_user) unless result.duplicate
        render json: { data: payload(result), duplicate: result.duplicate }, status: result.duplicate ? :ok : :created
      rescue Reviews::Submit::InvalidItem => e
        render_error("invalid_session_item", e.message, :unprocessable_content)
      end

      def due
        render json: { data: { due_count: LearningSessions::Plan.new(current_user).due_count } }
      end

      private

      def payload(result)
        { review: { id: result.log.id, rating: result.log.rating, reviewed_at: result.log.reviewed_at },
          progress: result.progress && { state: result.progress.state, due_at: result.progress.due_at,
                                         interval_days: result.progress.interval_days, reps: result.progress.reps },
          session: LearningSessionSerializer.progress(result.session) }
      end
    end
  end
end
