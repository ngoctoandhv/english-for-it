# Error tracking through Sentry (free tier) when SENTRY_DSN is set. No personal data is attached: send_default_pii is off,
# so user emails and IP addresses are not sent, and Rails parameter filtering still applies. Performance tracing is off.
if ENV["SENTRY_DSN"].present?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN"]
    config.environment = ENV.fetch("SENTRY_ENVIRONMENT", Rails.env)
    config.send_default_pii = false
    config.traces_sample_rate = 0.0
    config.breadcrumbs_logger = [ :active_support_logger ]
  end
end
