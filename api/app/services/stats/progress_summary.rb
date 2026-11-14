module Stats
  class ProgressSummary
    MATURE_DAYS = 21

    def initialize(user, now: Time.current)
      @user = user
      @now = now
    end

    def call
      progress = @user.user_word_progresses
      total = @user.review_logs.count
      remembered = @user.review_logs.where.not(rating: "again").count
      {
        words: {
          started: progress.count,
          learning: progress.where("interval_days < 1").count,
          young: progress.where(interval_days: 1...MATURE_DAYS).count,
          mature: progress.where("interval_days >= ?", MATURE_DAYS).count
        },
        reviews: { total: total, accuracy: total.zero? ? nil : (remembered * 100.0 / total).round },
        by_day: DailyCounts.call(@user, days: 14, now: @now)
      }
    end
  end
end
