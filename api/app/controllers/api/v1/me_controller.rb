module Api
  module V1
    class MeController < BaseController
      include Authenticatable

      def show
        render json: { user: UserSerializer.call(current_user) }
      end

      def update
        current_user.update!(params.expect(user: [ :name, :level, :daily_goal_minutes, :time_zone ]))
        render json: { user: UserSerializer.call(current_user) }
      end

      def onboarding
        attrs = params.expect(user: [ :level, :daily_goal_minutes, :time_zone ])
        raise ActionController::ParameterMissing, :level if attrs[:level].blank?

        current_user.update!(attrs.merge(onboarded_at: Time.current))
        render json: { user: UserSerializer.call(current_user) }
      end
    end
  end
end
