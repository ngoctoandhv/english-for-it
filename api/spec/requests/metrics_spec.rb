require "rails_helper"

RSpec.describe "Events, reports and metrics", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:headers) { auth_headers(user) }
  let(:admin) { create(:user, :admin) }

  describe "POST /events" do
    it "records app_open once per day and refuses other names" do
      2.times { post "/api/v1/events", params: { name: "app_open" }, headers: headers, as: :json }
      expect(response).to have_http_status(:no_content)
      expect(Event.where(user: user, name: "app_open").count).to eq(1)

      post "/api/v1/events", params: { name: "signup" }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "records signup on registration" do
      post "/api/v1/auth/register", params: { user: { email: "ev@example.test", password: "correct-horse-battery", name: "E" } }, as: :json
      expect(Event.where(name: "signup").count).to eq(1)
    end
  end

  describe "content reports" do
    let(:word) { create(:vocabulary_word, term: "commit") }

    it "stores a report for a word and notes it in the event log" do
      post "/api/v1/reports", params: { report: { type: "word", id: word.id, message: "IPA looks wrong" } }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(ContentReport.last).to have_attributes(user_id: user.id, reportable_type: "VocabularyWord", status: "open")
      expect(Event.where(name: "report_submitted").count).to eq(1)
    end

    it "rejects unknown types, empty and over-long messages" do
      post "/api/v1/reports", params: { report: { type: "user", id: user.id, message: "x" } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      post "/api/v1/reports", params: { report: { type: "word", id: word.id, message: " " } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      post "/api/v1/reports", params: { report: { type: "word", id: word.id, message: "a" * 501 } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "limits how many reports one user can send per day" do
      ContentReport::DAILY_LIMIT.times { ContentReport.create!(user: user, reportable_type: "VocabularyWord", reportable_id: word.id, message: "x") }
      post "/api/v1/reports", params: { report: { type: "word", id: word.id, message: "one more" } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "lets an admin triage reports but not learners" do
      report = ContentReport.create!(user: user, reportable_type: "VocabularyWord", reportable_id: word.id, message: "typo")
      get "/api/v1/admin/reports", headers: headers
      expect(response).to have_http_status(:forbidden)

      get "/api/v1/admin/reports", headers: auth_headers(admin)
      expect(json["data"].first).to include("message" => "typo", "target" => "commit", "reporter" => user.name)
      patch "/api/v1/admin/reports/#{report.id}", params: { report: { status: "resolved" } }, headers: auth_headers(admin), as: :json
      expect(report.reload.status).to eq("resolved")
    end
  end

  describe "GET /admin/metrics" do
    it "is admin only" do
      get "/api/v1/admin/metrics", headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "computes active users and day-1 / day-7 return for signup cohorts" do
      travel_to Time.utc(2026, 3, 20, 12) do
        returned = create(:user, created_at: Time.utc(2026, 3, 10, 9))
        gone = create(:user, created_at: Time.utc(2026, 3, 10, 9))
        word = create(:vocabulary_word)
        ReviewLog.create!(user: returned, vocabulary_word: word, rating: "good", client_request_id: "d1", reviewed_at: Time.utc(2026, 3, 11, 8)) # day 1
        Event.create!(user: returned, name: "app_open", created_at: Time.utc(2026, 3, 17, 8)) # day 7
        Event.create!(user: gone, name: "app_open", created_at: Time.utc(2026, 3, 10, 10))      # same day only

        get "/api/v1/admin/metrics", headers: auth_headers(admin)
        data = json["data"]
        expect(data["retention"]["day_1"]).to include("returned" => 1)
        expect(data["retention"]["day_1"]["cohort"]).to be >= 2
        expect(data["retention"]["day_7"]).to include("returned" => 1)
        expect(data["active"]["last_30d"]).to be >= 2
        expect(data["funnel"].keys).to eq(%w[signed_up onboarded first_review first_unit])
        expect(data["reports"]).to eq("open" => 0)
      end
    end
  end

  it "deletes a user's events and reports together with the account" do
    ContentReport.create!(user: user, reportable_type: "VocabularyWord", reportable_id: create(:vocabulary_word).id, message: "x")
    Event.record(user, "app_open")
    delete "/api/v1/me", params: { password: "correct-horse-battery" }, headers: headers, as: :json
    expect(response).to have_http_status(:no_content)
    expect(Event.where(user_id: user.id)).to be_empty
    expect(ContentReport.where(user_id: user.id)).to be_empty
  end
end
