# Content moves draft -> reviewed -> published. Only published content is visible to learners.
module Publishable
  extend ActiveSupport::Concern
  STATUSES = %w[draft reviewed published].freeze

  included do
    validates :status, inclusion: { in: STATUSES }
    scope :published, -> { where(status: "published") }
  end

  def published? = status == "published"
end
