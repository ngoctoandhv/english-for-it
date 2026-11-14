class UserSerializer
  def self.call(user)
    {
      id: user.id, email: user.email, name: user.name, role: user.role, level: user.level,
      daily_goal_minutes: user.daily_goal_minutes, focus_role: user.focus_role, focus_goal: user.focus_goal, time_zone: user.time_zone,
      onboarded: user.onboarded?, email_verified: user.email_verified?, created_at: user.created_at
    }
  end
end
