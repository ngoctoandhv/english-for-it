module Api
  module V1
    class GrowthController < BaseController
      include Authenticatable

      def show
        Path::Completions.sync!(current_user)
        calendar = Growth::Calendar.call(current_user)
        render json: { data: Growth::Xp.new(current_user).call.merge(calendar: calendar[:days], week: calendar[:week],
                                                                    active_days_total: calendar[:active_days_total],
                                                                    units_completed: current_user.unit_completions.count) }
      end
    end
  end
end
