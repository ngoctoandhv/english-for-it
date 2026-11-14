module Path
  # The learner's route: levels -> units -> steps, with state and the next thing to do.
  class Overview
    LEVELS = PathUnit::LEVELS

    def initialize(user)
      @user = user
      units = PathUnit.published.ordered.includes(path_steps: %i[learning_collection listening_lesson it_scenario]).to_a
      # Stable sort: units aimed at a different role or goal move to the end of their level.
      @units = units.each_with_index.sort_by { |u, i| [ LEVELS.index(u.level), u.relevance_for(user), i ] }.map(&:first)
      @progress = Progress.new(user).preload(@units)
      @completed_ids = user.unit_completions.pluck(:path_unit_id).to_set
    end

    def call
      start_index = LEVELS.index(@user.level) || 0
      previous_level_done = true
      levels = LEVELS.each_with_index.map do |level, li|
        units = @units.select { |u| u.level == level }
        previous_unit_done = nil
        built = units.each_with_index.map do |unit, i|
          unlocked =
            if li < start_index then true
            elsif i.zero? then li == start_index || previous_level_done
            else previous_unit_done
            end
          payload = unit_payload(unit, unlocked)
          previous_unit_done = payload[:status] == "completed"
          payload
        end
        previous_level_done = built.all? { |u| u[:status] == "completed" } && built.any?
        { level: level, units: built }
      end
      { start_level: LEVELS[start_index], levels: levels, next_up: next_up(levels) }
    end

    def unit_payload(unit, unlocked)
      steps = unit.live_steps.map { |s| step_payload(s, unit) }
      complete = @completed_ids.include?(unit.id) || (steps.any? && steps.all? { |s| s[:complete] })
      started = steps.any? { |s| s[:done].positive? }
      status = complete ? "completed" : !unlocked ? "locked" : started ? "in_progress" : "available"
      done = steps.count { |s| s[:complete] }
      { slug: unit.slug, title: unit.title, description: unit.description, level: unit.level, status: status,
        recommended: unit.audiences.any? && unit.matches?(@user),
        steps_done: done, steps_total: steps.size, steps: steps,
        next_step: status == "completed" || status == "locked" ? nil : steps.find { |s| !s[:complete] } }
    end

    private

    def step_payload(step, unit)
      state = @progress.step(step, unit)
      ref = step.reference
      base = { id: step.id, kind: step.kind, done: state[:done], total: state[:total], complete: state[:complete] }
      case step.kind
      when "words" then base.merge(title: ref.title, target: { collection: ref.slug })
      when "listening" then base.merge(title: ref.title, target: { lesson_id: ref.id })
      when "scenario" then base.merge(title: ref.title, target: { scenario: ref.slug })
      else base.merge(title: nil, target: { unit: unit.slug })
      end
    end

    def next_up(levels)
      units = levels.flat_map { |l| l[:units] }
      unit = units.find { |u| u[:status] == "in_progress" } || units.find { |u| u[:status] == "available" }
      unit && { unit: unit[:slug], unit_title: unit[:title], step: unit[:next_step], steps_done: unit[:steps_done], steps_total: unit[:steps_total] }
    end
  end
end
