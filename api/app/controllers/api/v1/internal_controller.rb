module Api
  module V1
    # Endpoints for the scheduler, protected by a shared secret (CRON_SECRET). Disabled when the secret is not set.
    class InternalController < BaseController
      def reminders
        secret = ENV["CRON_SECRET"].to_s
        given = request.headers["X-Cron-Secret"].to_s
        unless secret.present? && ActiveSupport::SecurityUtils.secure_compare(given, secret)
          return render_error("unauthorized", "Missing or invalid secret", :unauthorized)
        end

        render json: { data: Reminders::Dispatch.call }
      end
    end
  end
end
