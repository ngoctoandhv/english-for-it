class ScenarioDialogue < ApplicationRecord
  include AudioAttachable

  ROLES = %w[other you].freeze

  belongs_to :it_scenario, inverse_of: :scenario_dialogues
  validates :speaker, :text_en, presence: true
  validates :role, inclusion: { in: ROLES }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
