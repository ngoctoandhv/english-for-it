# Throttle brute-force attempts on auth endpoints (rules are added in M1 together with auth).
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new unless Rails.env.production?

Rack::Attack.throttle("auth/ip", limit: 10, period: 60) do |req|
  req.ip if req.path.start_with?("/api/v1/auth/") && req.post?
end
