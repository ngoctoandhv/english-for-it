module Push
  # Sends one Web Push message. Needs VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT (a mailto: or https: contact).
  # Subscriptions the browser reports as gone (404/410) are deleted.
  module Sender
    def self.configured? = ENV["VAPID_PUBLIC_KEY"].present? && ENV["VAPID_PRIVATE_KEY"].present?
    def self.public_key = ENV["VAPID_PUBLIC_KEY"]

    # Returns the number of devices that accepted the message.
    def self.deliver(user, title:, body:, url: "/")
      return 0 unless configured?

      payload = { title: title, body: body, url: url }.to_json
      user.push_subscriptions.to_a.count do |sub|
        send_one(sub, payload)
      end
    end

    def self.send_one(sub, payload)
      WebPush.payload_send(
        message: payload, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth,
        vapid: { subject: ENV.fetch("VAPID_SUBJECT", "mailto:admin@localhost"), public_key: ENV["VAPID_PUBLIC_KEY"], private_key: ENV["VAPID_PRIVATE_KEY"] },
        ttl: 6.hours.to_i
      )
      true
    rescue WebPush::ExpiredSubscription, WebPush::InvalidSubscription, WebPush::Unauthorized
      sub.destroy
      false
    rescue StandardError => e
      Rails.logger.error("push failed: #{e.class}")
      false
    end
  end
end
