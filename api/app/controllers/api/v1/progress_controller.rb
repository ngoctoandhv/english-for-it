module Api
  module V1
    class ProgressController < BaseController
      include Authenticatable

      def show
        render json: { data: Stats::ProgressSummary.new(current_user).call }
      end

      def history
        page, per = page_params
        scope = current_user.review_logs.includes(:vocabulary_word).order(reviewed_at: :desc, id: :desc)
        total = scope.count
        logs = scope.offset((page - 1) * per).limit(per)
        data = logs.map do |l|
          { id: l.id, rating: l.rating, reviewed_at: l.reviewed_at,
            word: { id: l.vocabulary_word_id, term: l.vocabulary_word.term, meaning_vi: l.vocabulary_word.meaning_vi } }
        end
        render json: { data: data, meta: page_meta(page, per, total) }
      end
    end
  end
end
