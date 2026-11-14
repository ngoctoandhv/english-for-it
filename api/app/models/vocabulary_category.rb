class VocabularyCategory < ApplicationRecord
  has_many :vocabulary_words, dependent: :restrict_with_error

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  before_validation { self.slug = name.to_s.parameterize if slug.blank? }

  scope :ordered, -> { order(:position, :name) }
end
