class AccountMailer < ApplicationMailer
  def password_reset(user)
    @url = "#{WebUrl.base}/reset-password?token=#{user.generate_token_for(:password_reset)}"
    mail(to: user.email, subject: "Reset your English for IT password")
  end

  def verify_email(user)
    @url = "#{WebUrl.base}/verify-email?token=#{user.generate_token_for(:email_verification)}"
    mail(to: user.email, subject: "Confirm your email for English for IT")
  end
end
