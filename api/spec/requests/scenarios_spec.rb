require "rails_helper"

RSpec.describe "Scenarios", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:admin) { create(:user, :admin) }
  let!(:scenario) { create(:it_scenario, title: "Daily Standup") }

  it "requires authentication" do
    get "/api/v1/scenarios"
    expect(response).to have_http_status(:unauthorized)
  end

  it "lists published scenarios only and shows ordered dialogue lines" do
    create(:it_scenario, status: "draft", title: "Hidden")
    get "/api/v1/scenarios", headers: auth_headers(user)
    expect(json["data"].map { |s| s["slug"] }).to eq([ "daily-standup" ])
    expect(json["data"].first).to include("lines_count" => 3, "completed" => false)

    get "/api/v1/scenarios/daily-standup", headers: auth_headers(user)
    expect(json["data"]["dialogues"].map { |d| d["position"] }).to eq([ 0, 1, 2 ])
    expect(json["data"]["dialogues"][1]).to include("role" => "you", "tip" => "Be friendly")

    get "/api/v1/scenarios/hidden", headers: auth_headers(user)
    expect(response).to have_http_status(:not_found)
  end

  describe "progress" do
    def save(position, completed: nil, as: user)
      post "/api/v1/scenarios/daily-standup/progress", params: { progress: { last_position: position, completed: completed }.compact }, headers: auth_headers(as), as: :json
    end

    it "never moves backwards, clamps to the last line and marks completion permanently" do
      save(1)
      save(0)
      expect(json["data"]["last_position"]).to eq(1)
      save(99, completed: true)
      expect(json["data"]).to include("last_position" => 2, "completed" => true)
      save(0, completed: false)
      expect(json["data"]["completed"]).to be(true)
      expect(ScenarioProgress.count).to eq(1)
    end

    it "is private per user" do
      save(2, completed: true)
      get "/api/v1/scenarios", headers: auth_headers(create(:user))
      expect(json["data"].first["completed"]).to be(false)
    end
  end

  describe "admin" do
    let(:payload) do
      { scenario: { title: "Incident Update", level: "b1", status: "draft",
                    scenario_dialogues_attributes: [ { position: 0, speaker: "Lead", role: "other", text_en: "What happened?" },
                                                     { position: 1, speaker: "You", role: "you", text_en: "The site was down." } ] } }
    end

    it "is forbidden to learners" do
      post "/api/v1/admin/scenarios", params: payload, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "creates, edits and deletes scenarios with dialogue lines and validates them" do
      post "/api/v1/admin/scenarios", params: payload, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:created)
      expect(json["data"]["slug"]).to eq("incident-update")
      id = json["data"]["id"]

      patch "/api/v1/admin/scenarios/#{id}", params: { scenario: { status: "published" } }, headers: auth_headers(admin), as: :json
      expect(json["data"]["status"]).to eq("published")

      bad = { scenario: { title: "Bad", scenario_dialogues_attributes: [ { position: 0, speaker: "A", role: "robot", text_en: "x" }, { position: 0, speaker: "B", text_en: "y" } ] } }
      post "/api/v1/admin/scenarios", params: bad, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:unprocessable_content)

      delete "/api/v1/admin/scenarios/#{id}", headers: auth_headers(admin)
      expect(response).to have_http_status(:no_content)
    end
  end
end
