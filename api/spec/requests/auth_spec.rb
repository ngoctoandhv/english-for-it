require "rails_helper"

RSpec.describe "Auth", type: :request do
  let(:valid) { { user: { email: "New@Example.test", password: "correct-horse-battery", name: "Lan" } } }

  describe "POST /api/v1/auth/register" do
    it "creates a user and returns tokens" do
      post "/api/v1/auth/register", params: valid, as: :json
      expect(response).to have_http_status(:created)
      expect(json["user"]["email"]).to eq("new@example.test")
      expect(json["access_token"]).to be_present
      expect(json["refresh_token"]).to be_present
      expect(json.to_s).not_to include("password_digest")
    end

    it "accepts the legacy time zone name that Chrome reports for Vietnam" do
      valid[:user][:time_zone] = "Asia/Saigon"
      post "/api/v1/auth/register", params: valid, as: :json
      expect(response).to have_http_status(:created)
      expect(json["user"]["time_zone"]).to eq("Asia/Ho_Chi_Minh")
    end

    it "falls back to UTC for an unknown time zone at sign-up but rejects it on update" do
      valid[:user][:time_zone] = "Mars/Olympus"
      post "/api/v1/auth/register", params: valid, as: :json
      expect(response).to have_http_status(:created)
      expect(json["user"]["time_zone"]).to eq("UTC")

      patch "/api/v1/me", params: { user: { time_zone: "Mars/Olympus" } }, headers: { "Authorization" => "Bearer #{json['access_token']}" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects a duplicate email regardless of case" do
      create(:user, email: "new@example.test")
      post "/api/v1/auth/register", params: valid, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig("error", "code")).to eq("validation_failed")
    end

    it "rejects short passwords" do
      valid[:user][:password] = "short"
      post "/api/v1/auth/register", params: valid, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "cannot self-assign the admin role" do
      valid[:user][:role] = "admin"
      post "/api/v1/auth/register", params: valid, as: :json
      expect(User.last.role).to eq("user")
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "a@example.test") }

    it "returns tokens for valid credentials" do
      post "/api/v1/auth/login", params: { user: { email: "A@example.test", password: "correct-horse-battery" } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(json["access_token"]).to be_present
    end

    it "returns 401 for a wrong password" do
      post "/api/v1/auth/login", params: { user: { email: "a@example.test", password: "nope-nope-nope" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
      expect(json.dig("error", "code")).to eq("invalid_credentials")
    end
  end

  describe "refresh and logout" do
    let(:user) { create(:user) }

    it "rotates refresh tokens and rejects reuse of the old one (revoking the family)" do
      tokens = Auth::IssueTokens.call(user)
      post "/api/v1/auth/refresh", params: { refresh_token: tokens.refresh_token }, as: :json
      expect(response).to have_http_status(:ok)
      fresh = json["refresh_token"]

      post "/api/v1/auth/refresh", params: { refresh_token: tokens.refresh_token }, as: :json
      expect(response).to have_http_status(:unauthorized)

      post "/api/v1/auth/refresh", params: { refresh_token: fresh }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "logout revokes the refresh token" do
      tokens = Auth::IssueTokens.call(user)
      delete "/api/v1/auth/logout", params: { refresh_token: tokens.refresh_token }, as: :json
      expect(response).to have_http_status(:no_content)
      post "/api/v1/auth/refresh", params: { refresh_token: tokens.refresh_token }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects an expired refresh token" do
      tokens = Auth::IssueTokens.call(user)
      user.refresh_tokens.update_all(expires_at: 1.minute.ago)
      post "/api/v1/auth/refresh", params: { refresh_token: tokens.refresh_token }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
