# Account emails must never break a request: a mail failure is logged and the user can ask again.
module MailDelivery
  extend ActiveSupport::Concern

  private

  def deliver_verification(user)
    AccountMailer.verify_email(user).deliver_now
  rescue StandardError => e
    Rails.logger.error("verification email failed: #{e.class}")
  end
end
