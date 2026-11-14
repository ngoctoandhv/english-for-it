# Development-only accounts. Never loaded in production (see db/seeds.rb).
{ "admin@example.test" => { name: "Dev Admin", role: "admin" },
  "learner@example.test" => { name: "Dev Learner", role: "user" } }.each do |email, attrs|
  user = User.find_or_initialize_by(email: email)
  next unless user.new_record?

  user.update!(attrs.merge(password: "dev-password-123", level: "a2", time_zone: "Asia/Ho_Chi_Minh",
                           onboarded_at: Time.current))
end
