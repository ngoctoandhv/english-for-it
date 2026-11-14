namespace :push do
  desc "Print a new VAPID key pair for Web Push (put them in VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY)"
  task keys: :environment do
    keys = WebPush.generate_key
    puts "VAPID_PUBLIC_KEY=#{keys.public_key}"
    puts "VAPID_PRIVATE_KEY=#{keys.private_key}"
  end
end
