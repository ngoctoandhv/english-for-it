module Api
  module V1
    class EmailVerificationsController < BaseController
      def verify
        user = User.find_by_token_for(:email_verification, params.expect(:token).to_s)
        return render_error("invalid_token", "This link is invalid or has expired", :unprocessable_content) unless user

        user.update_column(:email_verified_at, Time.current) unless user.email_verified?
        head :no_content
      end
    end
  end
end
