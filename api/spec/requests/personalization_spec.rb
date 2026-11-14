require "rails_helper"

RSpec.describe "Personalization", type: :request do
  let(:user) { create(:user, :onboarded, level: "elementary") }
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
    before { create_list(:vocabulary_word, 12) }

    it "serves ten choice questions without revealing answers" do
      get "/api/v1/placement", headers: headers
      questions = json["data"]["questions"]
      expect(questions.size).to eq(10)
      expect(questions.first.keys).to include("term", "options")
      expect(questions.first.to_s).not_to include("correct")
    end

    it "suggests a level from the score" do
      answer = lambda do |right|
        get "/api/v1/placement", headers: headers
        answers = json["data"]["questions"].each_with_index.map do |q, i|
          pick = i < right ? q["word_id"] : q["options"].find { |o| o["word_id"] != q["word_id"] }["word_id"]
          { word_id: q["word_id"], choice_word_id: pick }
        end
        post "/api/v1/placement/answers", params: { answers: answers }, headers: headers, as: :json
        json["data"]
      end
      expect(answer.call(10)).to include("score" => 10, "suggested_level" => "intermediate")
      expect(answer.call(6)).to include("suggested_level" => "elementary")
      expect(answer.call(2)).to include("suggested_level" => "beginner")
    end

    it "requires sign-in" do
      get "/api/v1/placement"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
