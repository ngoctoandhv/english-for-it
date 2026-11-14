module Reminders
  # Called once an hour by an external scheduler (see docs/deployment.md). For every learner whose chosen reminder hour is now in their
  # own time zone, sends at most one calm daily reminder, and on Mondays a short recap of last week. Never sends a streak or guilt message.
  class Dispatch
    def self.call(now: Time.current) = new(now).call

    def initialize(now)
      @now = now
    end

    def call
      sent = { reminders: 0, recaps: 0 }
      User.where.not(reminder_hour: nil).where(id: PushSubscription.select(:user_id)).find_each do |user|
        local = @now.in_time_zone(user.time_zone)
        next unless local.hour == user.reminder_hour

        today = local.to_date
        sent[:recaps] += 1 if recap(user, today)
        sent[:reminders] += 1 if remind(user, today)
      end
      sent
    end

    private

    def remind(user, today)
      return false if user.reminder_last_sent_on == today

      plan = LearningSessions::Plan.new(user, now: @now)
      due = plan.due_count
      new_slots = plan.new_slots([ due, plan.goal_cards ].min)
      cards = [ due, plan.goal_cards ].min + new_slots
      return false if cards.zero?

      user.update_columns(reminder_last_sent_on: today)
      Push::Sender.deliver(user, title: "English for IT", body: "#{cards} cards are ready. About #{[ (cards / 2.0).ceil, 1 ].max} minutes.", url: "/learn").positive?
    end

    def recap(user, today)
      return false unless today.monday? && user.recap_last_sent_on != today

      week = DailyCounts.call(user, days: 7, now: @now - 1.day)
      reviews = week.sum { |d| d[:reviews] }
      days = week.count { |d| d[:reviews].positive? }
      return false if reviews.zero?

      solid = Stats::Vocabulary.new(user).call.values_at(:solid, :mastered).sum
      user.update_columns(recap_last_sent_on: today)
      body = "Last week: #{days} #{'day'.pluralize(days)}, #{reviews} #{'review'.pluralize(reviews)}. #{solid} #{'word'.pluralize(solid)} solid so far."
      Push::Sender.deliver(user, title: "Your week", body: body, url: "/progress").positive?
    end

    DailyCounts = Stats::DailyCounts
  end
end
