class ApplicationMailer < ActionMailer::Base
  default from: -> { ENV.fetch("MAIL_FROM", "English for IT <no-reply@localhost>") }
  layout false
end
