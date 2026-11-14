class User < ApplicationRecord
  ROLES = %w[user admin].freeze
  LEVELS = %w[beginner elementary intermediate].freeze
  GOALS = [ 5, 10, 15 ].freeze
  FOCUS_ROLES = %w[developer qa devops analyst manager other].freeze
  FOCUS_GOALS = %w[daily_work interview docs].freeze

  has_secure_password
  # Single use: the token embeds a fragment of the current password hash, so it stops working once the password changes.
  generates_token_for(:password_reset, expires_in: 30.minutes) { password_salt }
  generates_token_for(:email_verification, expires_in: 3.days) { email }
  has_many :refresh_tokens, dependent: :destroy
  has_many :user_favorites, dependent: :destroy
  has_many :user_word_progresses, dependent: :destroy
  has_many :learning_sessions, dependent: :destroy
  has_many :listening_attempts, dependent: :destroy
  has_many :scenario_progresses, dependent: :destroy
  has_many :unit_completions, dependent: :destroy
  has_many :unit_quiz_results, dependent: :destroy
  has_many :review_logs, dependent: :restrict_with_error # erased only through Accounts::Erase

  normalizes :email, with: ->(e) { e.strip.downcase }
  before_update { self.email_verified_at = nil if email_changed? }

  normalizes :name, with: ->(n) { n.strip }

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 10, maximum: 72 }, allow_nil: true
  validates :name, presence: true, length: { maximum: 100 }
  validates :role, inclusion: { in: ROLES }
  validates :level, inclusion: { in: LEVELS }, allow_nil: true
  validates :focus_role, inclusion: { in: FOCUS_ROLES }, allow_nil: true
  validates :focus_goal, inclusion: { in: FOCUS_GOALS }, allow_nil: true
  validates :daily_goal_minutes, inclusion: { in: GOALS }
  validate :time_zone_must_be_valid

  def admin? = role == "admin"
  def onboarded? = onboarded_at.present?
  def email_verified? = email_verified_at.present?

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
