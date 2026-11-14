# A scripted (not AI) communication lesson: a fixed dialogue the learner steps through. Lines with role "you"
# are the learner's lines to practise.
class ItScenario < ApplicationRecord
  include Publishable

  LEVELS = Cefr::LEVELS
  normalizes :level, with: ->(l) { Cefr.normalize(l) }

  has_many :scenario_dialogues, -> { order(:position) }, dependent: :destroy, inverse_of: :it_scenario
  has_many :scenario_progresses, dependent: :destroy
  accepts_nested_attributes_for :scenario_dialogues, allow_destroy: true

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  validates :level, inclusion: { in: LEVELS }
  before_validation { self.slug = title.to_s.parameterize if slug.blank? }
  validate :dialogue_positions_are_unique

  scope :ordered, -> { order(:position, :id) }

  private

  def dialogue_positions_are_unique
    live = scenario_dialogues.reject(&:marked_for_destruction?).map(&:position)
    errors.add(:scenario_dialogues, "must have unique positions") if live.size != live.uniq.size
  end
end
