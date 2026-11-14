# CEFR levels used across the app (learners, words, lessons, scenarios, path units).
# Older data used beginner/elementary/intermediate; those names are still accepted and mapped.
module Cefr
  LEVELS = %w[a1 a2 b1 b2].freeze
  LEGACY = { "beginner" => "a1", "elementary" => "a2", "intermediate" => "b1", "upper_intermediate" => "b2" }.freeze

  def self.normalize(value)
    v = value.to_s.strip.downcase
    return nil if v.empty?

    LEGACY.fetch(v, v)
  end

  def self.rank(level) = LEVELS.index(level.to_s) || 0
end
