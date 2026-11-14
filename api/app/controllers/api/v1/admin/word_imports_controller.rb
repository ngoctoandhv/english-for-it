module Api
  module V1
    module Admin
      class WordImportsController < BaseController
        # POST /admin/words/import  { csv: "...", dry_run: true|false }
        def create
          csv = params.expect(:csv).to_s
          result = Vocabulary::CsvImport.call(csv, dry_run: ActiveModel::Type::Boolean.new.cast(params[:dry_run]))
          render json: { data: { created: result.created, updated: result.updated, errors: result.errors, dry_run: ActiveModel::Type::Boolean.new.cast(params[:dry_run]) || false } }
        end
      end
    end
  end
end
