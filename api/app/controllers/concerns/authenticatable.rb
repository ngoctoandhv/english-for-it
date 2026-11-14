module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    attr_reader :current_user
  end

  private

  def authenticate_user!
    token = request.authorization.to_s[/\ABearer (.+)\z/, 1]
    user_id = token && Auth::IssueTokens.user_id_from(token)
    @current_user = User.find_by(id: user_id) if user_id
    render_error("unauthorized", "Missing or invalid access token", :unauthorized) unless @current_user
  end

  def require_admin!
    render_error("forbidden", "Admin access required", :forbidden) unless current_user&.admin?
  end
end
