module Api
  module V1
    class BaseController < ActionController::API
      rescue_from ActiveRecord::RecordNotFound do
        render_error("not_found", "Resource not found", :not_found)
      end
      rescue_from ActiveRecord::RecordInvalid do |e|
        render_error("validation_failed", "Validation failed", :unprocessable_content, e.record.errors.to_hash)
      end
      rescue_from ActionController::ParameterMissing do |e|
        render_error("bad_request", e.message, :bad_request)
      end

      private

      # Every API error uses the same shape: { error: { code, message, details } }.
      def render_error(code, message, status, details = nil)
        render json: { error: { code: code, message: message, details: details } }, status: status
      end

      def render_tokens(user, tokens, status: :ok)
        render json: {
          user: UserSerializer.call(user),
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in
        }, status: status
      end

      def page_params(default: 20, max: 100)
        page = [ params[:page].to_i, 1 ].max
        per = params[:per_page].to_i
        per = default if per <= 0
        [ page, [ per, max ].min ]
      end

      def page_meta(page, per, total)
        { page: page, per_page: per, total: total, total_pages: (total / per.to_f).ceil }
      end
    end
  end
end
