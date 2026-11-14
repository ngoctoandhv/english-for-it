class ListeningLesson < ApplicationRecord
  include Publishable
  include AudioAttachable

  LEVELS = Cefr::LEVELS
  normalizes :level, with: ->(l) { Cefr.normalize(l) }

  has_many :listening_questions, -> { order(:position, :id) }, dependent: :destroy, inverse_of: :listening_lesson
  has_many :listening_attempts, dependent: :destroy
  accepts_nested_attributes_for :listening_questions, allow_destroy: true

  validates :title, :transcript_en, presence: true
  validates :level, inclusion: { in: LEVELS }
  validates :duration_seconds, numericality: { greater_than: 0, allow_nil: true }

  scope :ordered, -> { order(:position, :id) }
end
