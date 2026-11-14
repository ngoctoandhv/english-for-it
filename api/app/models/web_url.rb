# Base URL of the web app, used for links in emails.
module WebUrl
  def self.base = ENV.fetch("WEB_URL", "http://localhost:3101").chomp("/")
end
