class LearningSession < ApplicationRecord
  belongs_to :user
  has_many :learning_session_items, -> { order(:position) }, dependent: :destroy

  validates :status, inclusion: { in: %w[in_progress completed] }

  def completed? = status == "completed"

  def complete!
    return if completed?

    update!(status: "completed", completed_at: Time.current)
  end

  def finish_if_done!
    complete! if learning_session_items.where(completed_at: nil).none?
  end
end
