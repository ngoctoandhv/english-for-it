require "rails_helper"

RSpec.describe "Account management", type: :request do
  let(:user) { create(:user, :onboarded, password: "old-password-123") }
  let(:headers) { auth_headers(user) }

  def last_mail = ActionMailer::Base.deliveries.last

  before { ActionMailer::Base.deliveries.clear }

  describe "email verification" do
    it "sends a link on register and verifies with it" do
      post "/api/v1/auth/register", params: { user: { email: "v@example.test", password: "correct-horse-battery", name: "V" } }, as: :json
      expect(response).to have_http_status(:created)
      expect(json["user"]["email_verified"]).to be(false)
      token = last_mail.body.to_s[/token=([^\s]+)/, 1]

      post "/api/v1/auth/email/verify", params: { token: token }, as: :json
      expect(response).to have_http_status(:no_content)
      expect(User.find_by(email: "v@example.test")).to be_email_verified
    end

    it "rejects a garbage token" do
      post "/api/v1/auth/email/verify", params: { token: "nope" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig("error", "code")).to eq("invalid_token")
    end

    it "forgets verification when the email changes" do
      user.update!(email_verified_at: Time.current)
      user.update!(email: "other@example.test")
      expect(user).not_to be_email_verified
    end
  end

  describe "password reset" do
    it "answers the same for unknown emails and sends nothing" do
      post "/api/v1/auth/password/forgot", params: { email: "ghost@example.test" }, as: :json
      expect(response).to have_http_status(:no_content)
      expect(ActionMailer::Base.deliveries).to be_empty
    end

    it "emails a single-use link that sets a new password and signs out other sessions" do
      Auth::IssueTokens.call(user)
      post "/api/v1/auth/password/forgot", params: { email: user.email.upcase }, as: :json
      token = last_mail.body.to_s[/token=([^\s]+)/, 1]
      expect(last_mail.to).to eq([ user.email ])

      post "/api/v1/auth/password/reset", params: { token: token, password: "brand-new-password" }, as: :json
      expect(response).to have_http_status(:no_content)
      expect(user.reload.authenticate("brand-new-password")).to be_truthy
      expect(user.refresh_tokens.count).to eq(0)

      post "/api/v1/auth/password/reset", params: { token: token, password: "another-password-1" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "still validates the new password" do
      post "/api/v1/auth/password/forgot", params: { email: user.email }, as: :json
      token = last_mail.body.to_s[/token=([^\s]+)/, 1]
      post "/api/v1/auth/password/reset", params: { token: token, password: "short" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /me/password" do
    it "needs the current password" do
      patch "/api/v1/me/password", params: { user: { current_password: "wrong", new_password: "brand-new-password" } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      patch "/api/v1/me/password", params: { user: { current_password: "old-password-123", new_password: "brand-new-password" } }, headers: headers, as: :json
      expect(response).to have_http_status(:no_content)
      expect(user.reload.authenticate("brand-new-password")).to be_truthy
    end
  end

  describe "export and erase" do
    let!(:word) { create(:vocabulary_word, term: "commit") }

    before do
      UserWordProgress.create!(user: user, vocabulary_word: word, due_at: Time.current)
      ReviewLog.create!(user: user, vocabulary_word: word, rating: "good", client_request_id: "x1", reviewed_at: Time.current)
    end

    it "exports the user's own data" do
      get "/api/v1/me/export", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json["account"]["email"]).to eq(user.email)
      expect(json["reviews"].map { |r| r["word"] }).to eq([ "commit" ])
      expect(json.to_s).not_to include("password_digest")
    end

    it "deletes the account and its immutable review history only with the right password" do
      delete "/api/v1/me", params: { password: "wrong" }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(User.exists?(user.id)).to be(true)

      delete "/api/v1/me", params: { password: "old-password-123" }, headers: headers, as: :json
      expect(response).to have_http_status(:no_content)
      expect(User.exists?(user.id)).to be(false)
      expect(ReviewLog.where(user_id: user.id)).to be_empty
    end

    it "keeps review logs immutable for everyone else" do
      log = ReviewLog.find_by!(user: user)
      expect { ActiveRecord::Base.connection.execute("DELETE FROM review_logs WHERE id = #{log.id}") }.to raise_error(ActiveRecord::StatementInvalid, /immutable/)
    end
  end
end
