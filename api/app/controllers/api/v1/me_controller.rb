module Api
  module V1
    class MeController < BaseController
      include Authenticatable
      include MailDelivery

      def show
        render json: { user: UserSerializer.call(current_user) }
      end

      def update
        current_user.update!(params.expect(user: [ :name, :level, :daily_goal_minutes, :time_zone, :focus_role, :focus_goal ]))
        render json: { user: UserSerializer.call(current_user) }
      end

      def password
        attrs = params.expect(user: [ :current_password, :new_password ])
        unless current_user.authenticate(attrs[:current_password].to_s)
          return render_error("invalid_credentials", "Current password is incorrect", :unprocessable_content)
        end

        current_user.update!(password: attrs[:new_password].to_s)
        current_user.refresh_tokens.destroy_all
        head :no_content
      end

      def resend_verification
        deliver_verification(current_user) unless current_user.email_verified?
        head :no_content
      end

      def export
        render json: Accounts::Export.call(current_user)
      end

      def destroy
        unless current_user.authenticate(params.expect(:password).to_s)
          return render_error("invalid_credentials", "Password is incorrect", :unprocessable_content)
        end

        Accounts::Erase.call(current_user)
        head :no_content
      end

      def onboarding
        attrs = params.expect(user: [ :level, :daily_goal_minutes, :time_zone, :focus_role, :focus_goal ])
        raise ActionController::ParameterMissing, :level if attrs[:level].blank?

        current_user.update!(attrs.merge(onboarded_at: Time.current))
        render json: { user: UserSerializer.call(current_user) }
      end
    end
  end
end
