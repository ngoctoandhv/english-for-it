class UserFavorite < ApplicationRecord
  # API type name => model. Extended in later milestones (listening lessons, scenarios).
  TYPES = { "word" => "VocabularyWord" }.freeze

  belongs_to :user
  belongs_to :favoritable, polymorphic: true

  validates :favoritable_type, inclusion: { in: TYPES.values }
  validates :favoritable_id, uniqueness: { scope: %i[user_id favoritable_type] }

  def self.type_for(api_name) = TYPES.fetch(api_name.to_s) { raise ActiveRecord::RecordNotFound }
  def self.model_for(api_name) = type_for(api_name).constantize
end
