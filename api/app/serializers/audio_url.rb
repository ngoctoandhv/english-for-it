class AudioUrl
  def self.call(attachment)
    return nil unless attachment.attached?

    uri = URI(ENV.fetch("API_PUBLIC_URL", "http://localhost:3100"))
    Rails.application.routes.url_helpers.rails_blob_url(attachment, host: uri.host, port: uri.port, protocol: uri.scheme)
  end
end
