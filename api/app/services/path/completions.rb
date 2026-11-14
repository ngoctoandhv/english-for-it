module Path
  # Records units a learner has just completed. Safe to call after any learning action; returns the newly completed units.
  module Completions
    def self.sync!(user)
      units = PathUnit.published.ordered.includes(path_steps: %i[learning_collection listening_lesson it_scenario]).to_a
      done_ids = user.unit_completions.pluck(:path_unit_id).to_set
      pending = units.reject { |u| done_ids.include?(u.id) }
      return [] if pending.empty?

      progress = Progress.new(user).preload(pending)
      pending.select { |u| progress.unit_complete?(u) }.each_with_object([]) do |unit, newly|
        user.unit_completions.create!(path_unit: unit, completed_at: Time.current)
        newly << unit
      rescue ActiveRecord::RecordNotUnique
        next
      end
    end
  end
end
