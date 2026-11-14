# Public base URL of the API, used to build absolute audio URLs.
uri = URI(ENV.fetch("API_PUBLIC_URL", "http://localhost:3100"))
Rails.application.routes.default_url_options = { host: uri.host, port: uri.port, protocol: uri.scheme }
