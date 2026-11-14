# Append-only product event. Only the names below are accepted, and props hold ids and counts, never free text or personal data.
class Event < ApplicationRecord
  NAMES = %w[signup onboarded app_open session_started session_completed unit_completed scenario_completed report_submitted].freeze
  CLIENT_NAMES = %w[app_open].freeze

  belongs_to :user, optional: true
  validates :name, inclusion: { in: NAMES }

  # Recording an event must never break the request that caused it.
  def self.record(user, name, props = {})
    create!(user: user, name: name, props: props, created_at: Time.current)
  rescue StandardError => e
    Rails.logger.error("event #{name} not recorded: #{e.class}")
    nil
  end
end
