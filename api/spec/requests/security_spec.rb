require "rails_helper"

RSpec.describe "Security", type: :request do
  let(:alice) { create(:user, :onboarded) }
  let(:bob) { create(:user, :onboarded) }

  describe "every admin route" do
    it "rejects anonymous requests and learners" do
      admin_routes = Rails.application.routes.routes.select { |r| r.path.spec.to_s.start_with?("/api/v1/admin") }
      expect(admin_routes).not_to be_empty
      admin_routes.each do |route|
        path = route.path.spec.to_s.sub("(.:format)", "").gsub(/:\w+/, "1")
        verb = route.verb.downcase.to_sym
        public_send(verb, path)
        expect(response).to have_http_status(:unauthorized), "#{verb} #{path} allowed anonymous access"
        public_send(verb, path, headers: auth_headers(alice), as: :json)
        expect(response).to have_http_status(:forbidden), "#{verb} #{path} allowed a learner"
      end
    end
  end

  describe "every learner route" do
    it "requires authentication" do
      open = %w[/api/v1/health /api/v1/auth/register /api/v1/auth/login /api/v1/auth/refresh /api/v1/auth/logout]
      Rails.application.routes.routes.each do |route|
        spec = route.path.spec.to_s.sub("(.:format)", "")
        next unless spec.start_with?("/api/v1/") && !spec.start_with?("/api/v1/admin") && !open.include?(spec)

        path = spec.gsub(/:\w+/, "1")
        public_send(route.verb.downcase.to_sym, path, as: :json)
        expect(response).to have_http_status(:unauthorized), "#{route.verb} #{path} is not protected"
      end
    end
  end

  describe "data isolation between users" do
    let!(:word) { create(:vocabulary_word) }

    it "never exposes or modifies another user's session" do
      session = LearningSessions::Start.call(alice)
      get "/api/v1/learning_sessions/#{session.id}", headers: auth_headers(bob)
      expect(response).to have_http_status(:not_found)
      post "/api/v1/learning_sessions/#{session.id}/complete", headers: auth_headers(bob)
      expect(response).to have_http_status(:not_found)
      expect(session.reload.status).to eq("in_progress")
    end

    it "does not let a user complete someone else's session item through a review" do
      session = LearningSessions::Start.call(alice)
      item = session.learning_session_items.first
      post "/api/v1/reviews", params: { review: { word_id: word.id, rating: "good", client_request_id: "z1", session_item_id: item.id } },
                              headers: auth_headers(bob), as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(item.reload.completed_at).to be_nil
    end

    it "keeps history, progress and favorites per user" do
      ReviewLog.create!(user: alice, vocabulary_word: word, rating: "good", client_request_id: "h1", reviewed_at: Time.current)
      get "/api/v1/history", headers: auth_headers(bob)
      expect(json["data"]).to be_empty
      get "/api/v1/progress", headers: auth_headers(bob)
      expect(json["data"]["reviews"]["total"]).to eq(0)
    end
  end

  describe "secrets" do
    it "stores refresh tokens only as digests" do
      tokens = Auth::IssueTokens.call(alice)
      expect(RefreshToken.where(token_digest: tokens.refresh_token)).to be_empty
      expect(RefreshToken.find_by(token_digest: RefreshToken.digest(tokens.refresh_token))).to be_present
    end

    it "never returns password digests" do
      get "/api/v1/me", headers: auth_headers(alice)
      expect(response.body).not_to include("password")
    end

    it "filters credentials from logs" do
      filter = ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters)
      filtered = filter.filter("user" => { "password" => "x", "email" => "a@b.c" }, "refresh_token" => "t", "access_token" => "t")
      expect(filtered.to_s).not_to match(/"x"|a@b\.c|"t"/)
    end
  end

  describe "input handling" do
    it "treats search input as data, not SQL" do
      create(:vocabulary_word, term: "safe")
      get "/api/v1/words", params: { q: "'; DROP TABLE vocabulary_words; --" }, headers: auth_headers(alice)
      expect(response).to have_http_status(:ok)
      expect(VocabularyWord.count).to eq(1)
    end

    it "rejects malformed JSON bodies cleanly" do
      post "/api/v1/auth/login", params: "{not json", headers: { "CONTENT_TYPE" => "application/json" }
      expect(response).to have_http_status(:bad_request)
      expect(json.dig("error", "code")).to eq("bad_request")
    end

    it "rejects oversized JSON bodies" do
      post "/api/v1/auth/login", params: { pad: "x" * 1_100_000 }.to_json, headers: { "CONTENT_TYPE" => "application/json" }
      expect(response).to have_http_status(:content_too_large)
    end
  end
end
