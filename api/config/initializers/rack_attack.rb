# Throttle brute-force attempts on auth endpoints.
Rack::Attack.enabled = !Rails.env.test?
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new unless Rails.env.production?

Rack::Attack.throttle("auth/ip", limit: (Rails.env.test? ? 10 : ENV.fetch("AUTH_THROTTLE_LIMIT", 10).to_i), period: 60) do |req|
  req.ip if req.path.start_with?("/api/v1/auth/") && req.post?
end

# Generic ceiling for the whole API (per IP) to blunt scraping and runaway clients.
Rack::Attack.throttle("api/ip", limit: 600, period: 5.minutes.to_i) do |req|
  req.ip if req.path.start_with?("/api/")
end

Rack::Attack.throttled_responder = lambda do |_req|
  body = { error: { code: "rate_limited", message: "Too many attempts, try again later", details: nil } }
  [ 429, { "Content-Type" => "application/json" }, [ body.to_json ] ]
end
