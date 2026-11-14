module Api
  module V1
    module Admin
      class ContentReportsController < ResourcesController
        def create = head(:method_not_allowed)

        private

        def model = ContentReport
        def index_scope = ContentReport.includes(:user).order(Arel.sql("CASE status WHEN 'open' THEN 0 ELSE 1 END"), id: :desc)
        def permitted = params.expect(report: [ :status ])

        def serialize(r)
          target = r.reportable
          { id: r.id, status: r.status, message: r.message, type: r.reportable_type, target_id: r.reportable_id,
            target: target && (target.try(:term) || target.try(:title) || target.try(:text_en)), reporter: r.user.name, created_at: r.created_at }
        end
      end
    end
  end
end
