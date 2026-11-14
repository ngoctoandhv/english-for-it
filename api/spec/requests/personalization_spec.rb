require "rails_helper"

RSpec.describe "Personalization", type: :request do
  let(:user) { create(:user, :onboarded, level: "a2") }
  let(:headers) { auth_headers(user) }

  describe "role and goal on the profile" do
    it "saves them and rejects unknown values" do
      patch "/api/v1/me", params: { user: { focus_role: "qa", focus_goal: "interview" } }, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(json["user"]).to include("focus_role" => "qa", "focus_goal" => "interview")

      patch "/api/v1/me", params: { user: { focus_role: "wizard" } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "path order" do
    let!(:general) { create(:path_unit, title: "General", position: 0) }
    let!(:for_ops) { create(:path_unit, title: "For Ops", position: 1, audiences: %w[devops]) }
    let!(:for_qa) { create(:path_unit, title: "For QA", position: 2, audiences: %w[qa]) }

    def order
      get "/api/v1/path", headers: headers
      json["data"]["levels"].flat_map { |l| l["units"] }
    end

    it "keeps the authored order when no role is set" do
      expect(order.map { |u| u["title"] }).to eq([ "General", "For Ops", "For QA" ])
      expect(order.map { |u| u["recommended"] }).to eq([ false, false, false ])
    end

    it "moves units aimed at another role to the end of the level and marks the learner's own" do
      user.update!(focus_role: "qa")
      units = order
      expect(units.map { |u| u["title"] }).to eq([ "General", "For QA", "For Ops" ])
      expect(units.map { |u| u["recommended"] }).to eq([ false, true, false ])
    end

    it "also matches the learner's goal" do
      user.update!(focus_goal: "interview")
      create(:path_unit, title: "Interview", position: 3, audiences: %w[interview])
      expect(order.map { |u| u["title"] }).to eq([ "General", "Interview", "For Ops", "For QA" ])
    end
  end

  describe "placement check" do
    before do
      { "a1" => 4, "a2" => 4, "b1" => 3, "b2" => 3 }.each { |lv, n| create_list(:vocabulary_word, n, cefr_level: lv) }
    end

    it "asks about words from every CEFR level without revealing answers" do
      get "/api/v1/placement", headers: headers
      questions = json["data"]["questions"]
      expect(questions.size).to eq(10)
      expect(questions.map { |q| q["level"] }.tally).to eq("a1" => 3, "a2" => 3, "b1" => 2, "b2" => 2)
      expect(questions.first.keys).to include("term", "options")
      expect(questions.first.to_s).not_to include("correct")
    end

    it "suggests the highest level passed with every level below it passed too" do
      answer = lambda do |right_levels|
        get "/api/v1/placement", headers: headers
        answers = json["data"]["questions"].map do |q|
          right = right_levels.include?(q["level"])
          { word_id: q["word_id"], choice_word_id: right ? q["word_id"] : q["options"].find { |o| o["word_id"] != q["word_id"] }["word_id"] }
        end
        post "/api/v1/placement/answers", params: { answers: answers }, headers: headers, as: :json
        json["data"]
      end
      expect(answer.call(%w[a1 a2 b1 b2])).to include("score" => 10, "suggested_level" => "b2")
      expect(answer.call(%w[a1 a2])).to include("suggested_level" => "a2")
      expect(answer.call(%w[a1 b1 b2])["suggested_level"]).to eq("a1") # a gap at A2 stops at A1
      expect(answer.call([])["suggested_level"]).to eq("a1")
      expect(answer.call(%w[a1])["by_level"]["a1"]).to eq("correct" => 3, "total" => 3)
    end

    it "requires sign-in" do
      get "/api/v1/placement"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
