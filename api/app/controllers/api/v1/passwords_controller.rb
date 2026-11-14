module Api
  module V1
    # Forgotten-password flow. "forgot" answers the same way whether or not the email exists, so it cannot be used to find accounts.
    class PasswordsController < BaseController
      def forgot
        user = User.find_by(email: params.expect(:email).to_s.strip.downcase)
        begin
          AccountMailer.password_reset(user).deliver_now if user
        rescue StandardError => e
          Rails.logger.error("password reset email failed: #{e.class}")
        end
        head :no_content
      end

      def reset
        user = User.find_by_token_for(:password_reset, params.expect(:token).to_s)
        return render_error("invalid_token", "This link is invalid or has expired", :unprocessable_content) unless user

        user.update!(password: params.expect(:password).to_s)
        user.refresh_tokens.destroy_all
        head :no_content
      end
    end
  end
end
