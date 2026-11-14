# Review scheduling entry point. The rest of the app only knows Scheduling.algorithm.call(state, rating, now:).
module Scheduling
  RATINGS = %w[again hard good easy].freeze

  # Immutable snapshot of a card's schedule.
  State = Struct.new(:state, :due_at, :interval_days, :ease, :reps, :lapses, keyword_init: true) do
    def to_h_for_log
      { state: state, due_at: due_at&.iso8601, interval_days: interval_days, ease: ease.to_f, reps: reps, lapses: lapses }
    end
  end

  def self.config
    @config ||= Rails.application.config_for(:scheduling).deep_symbolize_keys
  end

  def self.reload_config! = @config = nil

  # Swap the algorithm here (e.g. SM-2 or FSRS) without touching callers.
  def self.algorithm(config = self.config)
    case config.fetch(:algorithm)
    when "simple" then Scheduling::Simple.new(config)
    else raise ArgumentError, "unknown scheduling algorithm #{config[:algorithm].inspect}"
    end
  end

  def self.new_state(config = self.config, now: Time.current)
    State.new(state: "learning", due_at: now, interval_days: 0, ease: config.fetch(:initial_ease), reps: 0, lapses: 0)
  end
end
