# A unit is a fixed route through existing content: words, listening, scenarios, then a quiz.
class PathUnit < ApplicationRecord
  include Publishable

  LEVELS = %w[elementary intermediate].freeze

  has_many :path_steps, -> { order(:position) }, dependent: :destroy, inverse_of: :path_unit
  has_many :unit_completions, dependent: :destroy
  has_many :unit_quiz_results, dependent: :destroy
  accepts_nested_attributes_for :path_steps, allow_destroy: true

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  # Roles (developer, qa, devops, analyst, manager) and goals (daily_work, interview, docs) this unit is aimed at. Empty = everyone.
  validates :level, inclusion: { in: LEVELS }
  before_validation { self.slug = title.to_s.parameterize if slug.blank? }

  scope :ordered, -> { order(:position, :id) }

  # 0 = for everyone or aimed at this learner, 1 = aimed at someone else (moved to the end of its level). Never hides a unit.
  def relevance_for(user)
    audiences.empty? || matches?(user) ? 0 : 1
  end

  def matches?(user) = audiences.intersect?([ user.focus_role, user.focus_goal ].compact)

  # Steps whose content is still published. Unpublished content silently drops out of the route.
  def live_steps = path_steps.select(&:live?)

  def collection_word_ids
    ids = live_steps.select { |s| s.kind == "words" }.map(&:learning_collection_id)
    CollectionWord.joins(:vocabulary_word).merge(VocabularyWord.published).where(learning_collection_id: ids).distinct.pluck(:vocabulary_word_id)
  end
end
