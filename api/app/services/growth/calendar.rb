module Growth
  # Days with learning activity in the user's time zone. Empty days are simply empty (no streak, no penalty).
  class Calendar
    DAYS = 17 * 7
    WEEK_TARGET = 4

    def self.call(user, now: Time.current)
      today = user.local_today(now)
      from_date = today - (DAYS - 1)
      from = from_date.in_time_zone(user.time_zone).beginning_of_day
      counts = Hash.new(0)
      merge = ->(rel, column) { rel.where(column => from..).group(Arel.sql(local_day(column, user))).count.each { |d, n| counts[d] += n } }
      merge.call(user.review_logs, :reviewed_at)
      merge.call(user.listening_attempts, :completed_at)
      merge.call(user.scenario_progresses, :updated_at)
      merge.call(user.unit_quiz_results, :created_at)

      days = (0...DAYS).map { |i| d = from_date + i; { date: d.iso8601, count: counts.fetch(d, 0) } }
      week_start = today.beginning_of_week
      active = days.count { |d| Date.parse(d[:date]) >= week_start && d[:count].positive? }
      { days: days, week: { active_days: active, target: WEEK_TARGET, start: week_start.iso8601 },
        active_days_total: days.count { |d| d[:count].positive? } }
    end

    def self.local_day(column, user)
      ActiveRecord::Base.sanitize_sql_array([ "((#{column} AT TIME ZONE 'UTC') AT TIME ZONE ?)::date", user.time_zone ])
    end
  end
end
