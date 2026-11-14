class LearningSessionItem < ApplicationRecord
  belongs_to :learning_session
  belongs_to :vocabulary_word

  validates :kind, inclusion: { in: %w[new review] }

  def completed? = completed_at.present?
end
