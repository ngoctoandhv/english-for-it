# Append-only history. Immutable in Ruby (readonly) and in the database (trigger).
class ReviewLog < ApplicationRecord
  belongs_to :user
  belongs_to :vocabulary_word
  belongs_to :learning_session_item, optional: true

  validates :rating, inclusion: { in: Scheduling::RATINGS }
  validates :client_request_id, presence: true, length: { maximum: 100 }

  before_destroy { throw :abort }
  def readonly? = persisted? || super
end
