module Api
  module V1
    class AuthController < BaseController
      include MailDelivery

      def register
        user = User.new(params.expect(user: [ :email, :password, :name, :time_zone ]).to_h.compact_blank)
        user.save!
        Event.record(user, "signup")
        deliver_verification(user)
        render_tokens(user, Auth::IssueTokens.call(user, user_agent: request.user_agent), status: :created)
      end

      def login
        creds = params.expect(user: [ :email, :password ])
        user = User.find_by(email: creds[:email].to_s.strip.downcase)
        if user&.authenticate(creds[:password].to_s)
          render_tokens(user, Auth::IssueTokens.call(user, user_agent: request.user_agent))
        else
          render_error("invalid_credentials", "Email or password is incorrect", :unauthorized)
        end
      end

      def refresh
        user, tokens = Auth::RotateRefreshToken.call(params.require(:refresh_token), user_agent: request.user_agent)
        render_tokens(user, tokens)
      rescue Auth::RotateRefreshToken::Invalid
        render_error("invalid_refresh_token", "Refresh token is invalid or expired", :unauthorized)
      end

      def logout
        token = RefreshToken.find_by(token_digest: RefreshToken.digest(params[:refresh_token].to_s))
        token&.revoke! unless token&.revoked?
        head :no_content
      end
    end
  end
end
