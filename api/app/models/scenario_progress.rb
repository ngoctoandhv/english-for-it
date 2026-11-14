class ScenarioProgress < ApplicationRecord
  belongs_to :user
  belongs_to :it_scenario
  validates :it_scenario_id, uniqueness: { scope: :user_id }
end
