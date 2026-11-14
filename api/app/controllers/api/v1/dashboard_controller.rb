module Api
  module V1
    class DashboardController < BaseController
      include Authenticatable

      def show
        render json: { data: Stats::Dashboard.new(current_user).call }
      end
    end
  end
end
