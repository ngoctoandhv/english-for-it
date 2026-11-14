module Api
  module V1
    class ScenariosController < BaseController
      include Authenticatable

      def index
        scenarios = ItScenario.published.ordered.includes(:scenario_dialogues)
        progress = current_user.scenario_progresses.index_by(&:it_scenario_id)
        render json: { data: scenarios.map { |s| ScenarioSerializer.summary(s, progress: progress[s.id]) } }
      end

      def show
        scenario = find_scenario
        render json: { data: ScenarioSerializer.detail(scenario, progress: current_user.scenario_progresses.find_by(it_scenario: scenario)) }
      end

      # Records how far the learner got. Position never goes backwards; completion is permanent.
      def progress
        scenario = find_scenario
        attrs = params.expect(progress: [ :last_position, :completed ])
        max = scenario.scenario_dialogues.size - 1
        position = attrs[:last_position].to_i.clamp(0, [ max, 0 ].max)

        record = ScenarioProgress.find_or_initialize_by(user: current_user, it_scenario: scenario)
        record.last_position = [ record.last_position, position ].max
        record.completed_at ||= Time.current if ActiveModel::Type::Boolean.new.cast(attrs[:completed])
        record.save!
        Event.record(current_user, "scenario_completed", { scenario_id: scenario.id }) if record.saved_change_to_completed_at?
        newly = Path::Completions.sync!(current_user)
        render json: { data: { last_position: record.last_position, completed: record.completed_at.present?,
                               units_completed: newly.map { |u| { slug: u.slug, title: u.title } } } }
      rescue ActiveRecord::RecordNotUnique
        retry
      end

      private

      def find_scenario = ItScenario.published.includes(scenario_dialogues: { audio_attachment: :blob }).find_by!(slug: params[:id])
    end
  end
end
