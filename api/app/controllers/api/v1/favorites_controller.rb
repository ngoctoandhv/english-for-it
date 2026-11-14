module Api
  module V1
    class FavoritesController < BaseController
      include Authenticatable

      def index
        ids = current_user.user_favorites.where(favoritable_type: "VocabularyWord").order(created_at: :desc).pluck(:favoritable_id)
        words = VocabularyWord.published.where(id: ids).includes(:vocabulary_category, audio_attachment: :blob).index_by(&:id)
        render json: { data: ids.filter_map { |id| words[id] }.map { |w| VocabularySerializer.summary(w, favorite_ids: ids) } }
      end

      def create
        record = UserFavorite.model_for(params.require(:type)).find(params.require(:id))
        current_user.user_favorites.find_or_create_by!(favoritable_type: record.class.name, favoritable_id: record.id)
        head :created
      end

      def destroy
        type = UserFavorite.type_for(params[:type])
        current_user.user_favorites.where(favoritable_type: type, favoritable_id: params[:id]).destroy_all
        head :no_content
      end
    end
  end
end
