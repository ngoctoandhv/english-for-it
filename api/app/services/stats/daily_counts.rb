module Stats
  # Review counts per calendar day in the user's time zone (timestamps are stored in UTC).
  class DailyCounts
    def self.call(user, days:, now: Time.current)
      today = user.local_today(now)
      from = (today - (days - 1)).in_time_zone(user.time_zone).beginning_of_day
      local_day = ActiveRecord::Base.sanitize_sql_array([ "((reviewed_at AT TIME ZONE 'UTC') AT TIME ZONE ?)::date", user.time_zone ])
      counts = user.review_logs.where(reviewed_at: from..).group(Arel.sql(local_day)).count
      (0...days).map do |i|
        date = today - (days - 1 - i)
        { date: date.iso8601, reviews: counts.fetch(date, 0) }
      end
    end
  end
end
