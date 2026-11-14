module Api
  module V1
    class HealthController < BaseController
      def show
        render json: { status: "ok", database: database_ok? }
      end

      private

      def database_ok?
        ActiveRecord::Base.connection.execute("SELECT 1")
        true
      rescue StandardError
        false
      end
    end
  end
end
