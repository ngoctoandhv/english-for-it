module Api
  module V1
    class ReportsController < BaseController
      include Authenticatable

      def create
        attrs = params.expect(report: [ :type, :id, :message ])
        type = ContentReport::TYPES[attrs[:type].to_s]
        return render_error("validation_failed", "Unknown content type", :unprocessable_content) unless type

        record = type.constantize.find(attrs[:id])
        report = ContentReport.create!(user: current_user, reportable_type: type, reportable_id: record.id, message: attrs[:message].to_s.strip)
        Event.record(current_user, "report_submitted", { type: attrs[:type], id: record.id })
        render json: { data: { id: report.id } }, status: :created
      end
    end
  end
end
