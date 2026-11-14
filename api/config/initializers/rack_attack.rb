# Throttle brute-force attempts on auth endpoints.
Rack::Attack.enabled = !Rails.env.test?
Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new unless Rails.env.production?

Rack::Attack.throttle("auth/ip", limit: 10, period: 60) do |req|
  req.ip if req.path.start_with?("/api/v1/auth/") && req.post?
end

Rack::Attack.throttled_responder = lambda do |_req|
  body = { error: { code: "rate_limited", message: "Too many attempts, try again later", details: nil } }
  [ 429, { "Content-Type" => "application/json" }, [ body.to_json ] ]
end
