class LearningCollection < ApplicationRecord
  include Publishable

  has_many :collection_words, -> { order(:position) }, dependent: :destroy
  has_many :vocabulary_words, through: :collection_words

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  before_validation { self.slug = title.to_s.parameterize if slug.blank? }

  scope :ordered, -> { order(:position, :title) }

  # Replaces the words of this collection, keeping the given order.
  def replace_words!(word_ids)
    ids = Array(word_ids).map(&:to_i).uniq
    transaction do
      collection_words.destroy_all
      ids.each_with_index { |id, i| collection_words.create!(vocabulary_word_id: id, position: i) }
    end
  end
end
