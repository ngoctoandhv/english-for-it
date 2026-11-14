module Api
  module V1
    module Admin
      # Generic admin CRUD. Subclasses define: model, permitted (strong params), serialize(record),
      # and optionally index_scope / after_save(record).
      class ResourcesController < BaseController
        def index
          page, per = page_params
          scope = index_scope
          total = scope.count
          records = scope.offset((page - 1) * per).limit(per)
          render json: { data: records.map { |r| serialize(r) }, meta: page_meta(page, per, total) }
        end

        def show
          render json: { data: serialize(find_record) }
        end

        def create
          record = model.new
          save(record, :created)
        end

        def update
          save(find_record, :ok)
        end

        def destroy
          find_record.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotDestroyed => e
          render_error("conflict", e.message, :conflict, e.record.errors.to_hash)
        end

        # POST /…/:id/audio (multipart `audio`), DELETE /…/:id/audio
        def audio
          record = find_record
          record.audio.attach(params.require(:audio))
          record.save!
          render json: { data: serialize(record.reload) }
        end

        def remove_audio
          record = find_record
          record.audio.purge
          render json: { data: serialize(record.reload) }
        end

        private

        def index_scope = model.order(:id)
        def find_record = model.find(params[:id])
        def after_save(_record) = nil

        def save(record, status)
          record.transaction do
            record.assign_attributes(permitted)
            record.save!
            after_save(record)
          end
          render json: { data: serialize(record.reload) }, status: status
        end
      end
    end
  end
end
