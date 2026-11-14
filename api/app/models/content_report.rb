# A learner's note that a word, lesson, scenario or phrase looks wrong. Reviewed in the admin.
class ContentReport < ApplicationRecord
  TYPES = { "word" => "VocabularyWord", "listening" => "ListeningLesson", "scenario" => "ItScenario", "phrase" => "ToolkitPhrase" }.freeze
  STATUSES = %w[open resolved dismissed].freeze
  DAILY_LIMIT = 20

  belongs_to :user
  validates :reportable_type, inclusion: { in: TYPES.values }
  validates :message, presence: true, length: { maximum: 500 }
  validates :status, inclusion: { in: STATUSES }
  validate :within_daily_limit, on: :create

  def reportable = reportable_type.constantize.find_by(id: reportable_id)

  private

  def within_daily_limit
    return unless user && ContentReport.where(user_id: user.id, created_at: 1.day.ago..).count >= DAILY_LIMIT

    errors.add(:base, "Too many reports today")
  end
end
