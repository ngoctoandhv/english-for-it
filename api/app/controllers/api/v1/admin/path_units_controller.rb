module Api
  module V1
    module Admin
      # Learning path units. Steps are edited as one line each:
      #   words:<collection slug>   listening:<lesson id or exact title>   scenario:<scenario slug>   quiz
      class PathUnitsController < ResourcesController
        private

        def model = PathUnit
        def index_scope = PathUnit.ordered.includes(:path_steps)

        def permitted
          params.require(:unit).permit(:title, :slug, :description, :level, :status, :position, audiences: [])
        end

        def after_save(unit)
          lines = params.dig(:unit, :steps)
          return unless lines

          unit.path_steps.destroy_all
          Array(lines).map { |l| l.to_s.strip }.reject(&:blank?).each_with_index do |line, i|
            attrs = step_attributes(line)
            unless attrs
              unit.errors.add(:steps, "line #{i + 1} (#{line}) is not understood. Use words:slug, listening:id, scenario:slug or quiz")
              raise ActiveRecord::RecordInvalid, unit
            end
            step = unit.path_steps.build(attrs.merge(position: i))
            next if step.valid?

            unit.errors.add(:steps, "line #{i + 1} (#{line}): #{step.errors.full_messages.to_sentence}")
            raise ActiveRecord::RecordInvalid, unit
          end
          unit.path_steps.each(&:save!)
        end

        def step_attributes(line)
          kind, ref = line.split(":", 2).map(&:strip)
          case kind
          when "quiz" then { kind: "quiz" }
          when "words" then (c = LearningCollection.find_by(slug: ref)) && { kind: "words", learning_collection: c }
          when "scenario" then (s = ItScenario.find_by(slug: ref)) && { kind: "scenario", it_scenario: s }
          when "listening"
            l = ListeningLesson.find_by(id: ref.to_i.positive? ? ref.to_i : nil) || ListeningLesson.find_by(title: ref)
            l && { kind: "listening", listening_lesson: l }
          end
        end

        def serialize(u)
          steps = u.path_steps.sort_by(&:position).map do |s|
            case s.kind
            when "words" then "words:#{s.learning_collection&.slug}"
            when "listening" then "listening:#{s.listening_lesson_id}"
            when "scenario" then "scenario:#{s.it_scenario&.slug}"
            else "quiz"
            end
          end
          { id: u.id, title: u.title, slug: u.slug, description: u.description, level: u.level, status: u.status,
            position: u.position, audiences: u.audiences, steps: steps, steps_count: steps.size }
        end
      end
    end
  end
end
