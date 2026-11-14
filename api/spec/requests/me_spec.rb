require "rails_helper"

RSpec.describe "Me", type: :request do
  let(:user) { create(:user) }

  it "requires a token" do
    get "/api/v1/me"
    expect(response).to have_http_status(:unauthorized)
  end

  it "rejects a tampered or expired token" do
    get "/api/v1/me", headers: { "Authorization" => "Bearer garbage" }
    expect(response).to have_http_status(:unauthorized)

    token = Auth::IssueTokens.verifier.generate(user.id, purpose: :access, expires_in: 1.second)
    travel 5.seconds
    get "/api/v1/me", headers: { "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:unauthorized)
  end

  it "returns the current user" do
    get "/api/v1/me", headers: auth_headers(user)
    expect(json["user"]["email"]).to eq(user.email)
    expect(json["user"]["onboarded"]).to be(false)
  end

  it "completes onboarding" do
    post "/api/v1/me/onboarding", params: { user: { level: "a1", daily_goal_minutes: 5, time_zone: "Asia/Ho_Chi_Minh" } },
                                  headers: auth_headers(user), as: :json
    expect(response).to have_http_status(:ok)
    expect(json["user"]).to include("onboarded" => true, "level" => "a1", "time_zone" => "Asia/Ho_Chi_Minh")
  end

  it "rejects invalid onboarding values" do
    post "/api/v1/me/onboarding", params: { user: { level: "wizard", daily_goal_minutes: 7, time_zone: "Mars/Base" } },
                                  headers: auth_headers(user), as: :json
    expect(response).to have_http_status(:unprocessable_content)
    expect(json.dig("error", "details").keys).to include("level", "daily_goal_minutes", "time_zone")
  end

  it "does not allow changing role via update" do
    patch "/api/v1/me", params: { user: { name: "X", role: "admin" } }, headers: auth_headers(user), as: :json
    expect(user.reload.role).to eq("user")
  end
end
