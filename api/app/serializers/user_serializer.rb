class UserSerializer
  def self.call(user)
    {
      id: user.id, email: user.email, name: user.name, role: user.role, level: user.level,
      daily_goal_minutes: user.daily_goal_minutes, reminder_hour: user.reminder_hour, new_words_per_day: user.new_words_per_day, push_devices: user.push_subscriptions.size, focus_role: user.focus_role, focus_goal: user.focus_goal, time_zone: user.time_zone,
      onboarded: user.onboarded?, email_verified: user.email_verified?, created_at: user.created_at
    }
  end
end
