module AuthHelpers
  def auth_headers(user)
    { "Authorization" => "Bearer #{Auth::IssueTokens.call(user).access_token}" }
  end

  def json = response.parsed_body
end

RSpec.configure do |c|
  c.include AuthHelpers, type: :request
  c.include FactoryBot::Syntax::Methods
  c.include ActiveSupport::Testing::TimeHelpers
end
