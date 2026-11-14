# Ready-to-use work phrases (pull request feedback, standup, meetings, incidents, email) with a Vietnamese translation.
class ToolkitPhrase < ApplicationRecord
  include Publishable
  include AudioAttachable

  CATEGORIES = %w[pr_feedback standup meeting incident email].freeze

  validates :text_en, :text_vi, presence: true
  validates :category, inclusion: { in: CATEGORIES }

  scope :ordered, -> { order(:position, :id) }
end
