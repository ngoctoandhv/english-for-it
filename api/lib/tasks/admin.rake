namespace :admin do
  desc "Create or promote an admin: bin/rails admin:create EMAIL=a@b.c PASSWORD=... NAME=..."
  task create: :environment do
    email = ENV.fetch("EMAIL")
    user = User.find_or_initialize_by(email: email.downcase)
    user.name = ENV.fetch("NAME", "Admin") if user.new_record?
    user.password = ENV.fetch("PASSWORD") if user.new_record?
    user.role = "admin"
    user.save!
    puts "Admin ready: #{user.email}"
  end
end
