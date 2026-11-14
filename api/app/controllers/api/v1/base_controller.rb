module Api
  module V1
    class BaseController < ActionController::API
      rescue_from ActiveRecord::RecordNotFound do
        render_error("not_found", "Resource not found", :not_found)
      end

      private

      # Every API error uses the same shape: { error: { code, message, details } }.
      def render_error(code, message, status, details = nil)
        render json: { error: { code: code, message: message, details: details } }, status: status
      end
    end
  end
end
