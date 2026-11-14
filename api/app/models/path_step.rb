class PathStep < ApplicationRecord
  KINDS = %w[words listening scenario quiz].freeze

  belongs_to :path_unit, inverse_of: :path_steps
  belongs_to :learning_collection, optional: true
  belongs_to :listening_lesson, optional: true
  belongs_to :it_scenario, optional: true

  validates :kind, inclusion: { in: KINDS }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :reference_matches_kind

  def reference
    case kind
    when "words" then learning_collection
    when "listening" then listening_lesson
    when "scenario" then it_scenario
    end
  end

  def live? = kind == "quiz" || reference&.published?

  private

  def reference_matches_kind
    refs = { "words" => learning_collection, "listening" => listening_lesson, "scenario" => it_scenario }
    if kind == "quiz"
      errors.add(:base, "a quiz step has no reference") if refs.values.any?
    elsif kind.in?(%w[words listening scenario])
      errors.add(:base, "#{kind} step needs exactly its own reference") unless refs[kind] && refs.values.compact.size == 1
    end
  end
end
