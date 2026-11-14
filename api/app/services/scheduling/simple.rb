module Scheduling
  # Simple, configurable ease-based scheduler (SM-2 flavoured). Pure: no database access.
  class Simple
    def initialize(config)
      @c = config
    end

    # state: Scheduling::State, rating: "again"|"hard"|"good"|"easy" -> new Scheduling::State
    def call(state, rating, now:)
      raise ArgumentError, "invalid rating #{rating.inspect}" unless RATINGS.include?(rating)

      ease = [ state.ease.to_f + @c[:ease_delta].fetch(rating.to_sym), @c[:min_ease] ].max.round(2)
      return again(state, ease, now) if rating == "again"

      interval = next_interval(state, rating, ease)
      State.new(state: "review", due_at: now + interval.days, interval_days: interval, ease: ease,
                reps: state.reps + 1, lapses: state.lapses)
    end

    private

    def again(state, ease, now)
      State.new(state: "learning", due_at: now + @c[:again_minutes].minutes, interval_days: 0, ease: ease,
                reps: 0, lapses: state.lapses + 1)
    end

    def next_interval(state, rating, ease)
      current = state.interval_days
      raw =
        if state.reps.zero? || current.zero?
          @c[:first_interval_days].fetch(rating.to_sym)
        else
          case rating
          when "hard" then current * @c[:hard_multiplier]
          when "good" then current * ease
          when "easy" then current * ease * @c[:easy_bonus]
          end
        end
      interval = raw.round
      interval = [ interval, current + 1 ].max unless state.reps.zero? || current.zero? || rating == "hard"
      interval = [ interval, 1 ].max
      [ interval, @c[:max_interval_days] ].min
    end
  end
end
