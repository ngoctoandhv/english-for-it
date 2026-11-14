module Api
  module V1
    class PushController < BaseController
      include Authenticatable

      before_action :require_configured!

      def key
        render json: { data: { public_key: Push::Sender.public_key } }
      end

      def subscribe
        attrs = params.expect(subscription: [ :endpoint, :p256dh, :auth ])
        sub = PushSubscription.find_or_initialize_by(endpoint: attrs[:endpoint])
        sub.assign_attributes(user: current_user, p256dh: attrs[:p256dh], auth: attrs[:auth], user_agent: request.user_agent&.truncate(255))
        sub.save!
        current_user.update!(reminder_hour: 18) if current_user.reminder_hour.nil?
        render json: { user: UserSerializer.call(current_user) }, status: :created
      end

      def unsubscribe
        current_user.push_subscriptions.where(endpoint: params.expect(:endpoint)).destroy_all
        current_user.update!(reminder_hour: nil) unless current_user.push_subscriptions.exists?
        render json: { user: UserSerializer.call(current_user) }
      end

      def test
        sent = Push::Sender.deliver(current_user, title: "English for IT", body: "Reminders are on. See you soon.", url: "/")
        render json: { data: { sent: sent } }
      end

      private

      def require_configured!
        render_error("not_found", "Push is not configured", :not_found) unless Push::Sender.configured?
      end
    end
  end
end
