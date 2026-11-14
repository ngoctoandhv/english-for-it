module Api
  module V1
    module Admin
      class ItScenariosController < ResourcesController
        private

        def model = ItScenario
        def index_scope = ItScenario.ordered.includes(:scenario_dialogues)

        def permitted
          params.expect(scenario: [
            :title, :slug, :description, :situation, :level, :status, :position,
            { scenario_dialogues_attributes: [ %i[id position speaker role text_en text_vi tip _destroy] ] }
          ])
        end

        def serialize(s) = ScenarioSerializer.admin(s)
      end
    end
  end
end
