module Api
  module V1
    module Admin
      class MetricsController < BaseController
        def show
          render json: { data: Metrics::Overview.call }
        end
      end
    end
  end
end
