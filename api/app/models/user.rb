class User < ApplicationRecord
  ROLES = %w[user admin].freeze
  LEVELS = %w[beginner elementary intermediate].freeze
  GOALS = [ 5, 10, 15 ].freeze

  has_secure_password
  has_many :refresh_tokens, dependent: :destroy
  has_many :user_favorites, dependent: :destroy
  has_many :user_word_progresses, dependent: :destroy
  has_many :learning_sessions, dependent: :destroy
  has_many :review_logs, dependent: :restrict_with_error

  normalizes :email, with: ->(e) { e.strip.downcase }
  normalizes :name, with: ->(n) { n.strip }

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 10, maximum: 72 }, allow_nil: true
  validates :name, presence: true, length: { maximum: 100 }
  validates :role, inclusion: { in: ROLES }
  validates :level, inclusion: { in: LEVELS }, allow_nil: true
  validates :daily_goal_minutes, inclusion: { in: GOALS }
  validate :time_zone_must_be_valid

  def admin? = role == "admin"
  def onboarded? = onboarded_at.present?

  # Current calendar date for this user, used for "today" sessions and streak-free stats.
  def local_today(now = Time.current)
    now.in_time_zone(time_zone).to_date
  end

  private

  def time_zone_must_be_valid
    TZInfo::Timezone.get(time_zone)
  rescue TZInfo::InvalidTimezoneIdentifier
    errors.add(:time_zone, "is not a valid IANA time zone")
  end
end
