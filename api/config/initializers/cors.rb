require Rails.root.join("lib/rack_middleware/json_body_guard")
# Allowed web origins come from the environment (comma separated), never hard-coded.
allowed = ENV.fetch("CORS_ORIGINS", "http://localhost:3101").split(",").map(&:strip)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed)
    resource "/api/*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: %w[X-Request-Id]
  end
end

# Must run after CORS so error responses still carry CORS headers.
Rails.application.config.middleware.insert_after Rack::Cors, JsonBodyGuard
