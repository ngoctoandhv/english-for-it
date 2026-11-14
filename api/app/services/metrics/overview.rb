module Metrics
  # Product numbers for the admin. "Active" means the learner reviewed a card or opened the app on that UTC day.
  class Overview
    RETENTION_DAYS = [ 1, 7 ].freeze

    def self.call(now: Time.current) = new(now).call

    def initialize(now)
      @now = now
      @today = now.utc.to_date
    end

    def call
      {
        users: { total: User.count, new_7d: User.where(created_at: 7.days.ago(@now)..).count, new_30d: User.where(created_at: 30.days.ago(@now)..).count },
        active: { today: active_between(@today, @today), last_7d: active_between(@today - 6, @today), last_30d: active_between(@today - 29, @today) },
        retention: retention,
        funnel: funnel,
        learning_7d: {
          reviews: ReviewLog.where(reviewed_at: 7.days.ago(@now)..).count,
          sessions_started: Event.where(name: "session_started", created_at: 7.days.ago(@now)..).count,
          sessions_completed: Event.where(name: "session_completed", created_at: 7.days.ago(@now)..).count,
          units_completed: Event.where(name: "unit_completed", created_at: 7.days.ago(@now)..).count
        },
        reports: { open: ContentReport.where(status: "open").count }
      }
    end

    private

    def activity_sql
      <<~SQL.squish
        SELECT user_id, (reviewed_at AT TIME ZONE 'UTC')::date AS day FROM review_logs
        UNION
        SELECT user_id, (created_at AT TIME ZONE 'UTC')::date AS day FROM events WHERE name = 'app_open' AND user_id IS NOT NULL
      SQL
    end

    def active_between(from, to)
      sql = ActiveRecord::Base.sanitize_sql_array([ "SELECT COUNT(DISTINCT user_id) FROM (#{activity_sql}) a WHERE day BETWEEN ? AND ?", from, to ])
      ActiveRecord::Base.connection.select_value(sql).to_i
    end

    # Share of recent signups who came back exactly N days after the day they signed up. Only cohorts old enough to have a day N are counted.
    def retention
      sql = ActiveRecord::Base.sanitize_sql_array([ "SELECT user_id, day FROM (#{activity_sql}) a WHERE day >= ?", @today - 60 ])
      days = ActiveRecord::Base.connection.select_rows(sql)
      by_user = days.group_by(&:first).transform_values { |rows| rows.map { |r| r.last.to_date }.to_set }
      RETENTION_DAYS.to_h do |n|
        cohort = User.where(created_at: 60.days.ago(@now)..(n + 1).days.ago(@now)).pluck(:id, :created_at)
        back = cohort.count { |id, at| by_user[id]&.include?(at.utc.to_date + n) }
        [ "day_#{n}", { cohort: cohort.size, returned: back, rate: cohort.empty? ? nil : (back * 100.0 / cohort.size).round } ]
      end
    end

    def funnel
      since = 30.days.ago(@now)
      signups = User.where(created_at: since..)
      ids = signups.select(:id)
      {
        signed_up: signups.count,
        onboarded: signups.where.not(onboarded_at: nil).count,
        first_review: ReviewLog.where(user_id: ids).distinct.count(:user_id),
        first_unit: UnitCompletion.where(user_id: ids).distinct.count(:user_id)
      }
    end
  end
end
