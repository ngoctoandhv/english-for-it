module Api
  module V1
    class HealthController < BaseController
      def show
        render json: { status: "ok", database: database_ok?, redis: redis_ok? }
      end

      private

      def database_ok?
        ActiveRecord::Base.connection.execute("SELECT 1")
        true
      rescue StandardError
        false
      end

      def redis_ok?
        Sidekiq.redis { |c| c.ping } == "PONG"
      rescue StandardError
        false
      end
    end
  end
end
