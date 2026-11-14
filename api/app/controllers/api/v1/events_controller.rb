module Api
  module V1
    class EventsController < BaseController
      include Authenticatable

      # The client reports only that the app was opened; everything else is recorded on the server.
      def create
        name = params.expect(:name).to_s
        return render_error("validation_failed", "Unknown event", :unprocessable_content) unless Event::CLIENT_NAMES.include?(name)

        Event.record(current_user, name) unless Event.exists?(user_id: current_user.id, name: name, created_at: Time.current.beginning_of_day..)
        head :no_content
      end
    end
  end
end
