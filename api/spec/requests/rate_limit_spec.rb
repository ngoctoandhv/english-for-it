require "rails_helper"

RSpec.describe "Rate limiting", type: :request do
  around do |ex|
    Rack::Attack.enabled = true
    Rack::Attack.cache.store.clear
    ex.run
  ensure
    Rack::Attack.enabled = false
  end

  it "throttles repeated auth attempts" do
    11.times { post "/api/v1/auth/login", params: { user: { email: "x@example.test", password: "x" } }, as: :json }
    expect(response).to have_http_status(:too_many_requests)
    expect(json.dig("error", "code")).to eq("rate_limited")
  end
end
