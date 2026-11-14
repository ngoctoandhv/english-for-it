require "rails_helper"

RSpec.describe "Learning sessions and reviews", type: :request do
  let(:user) { create(:user, :onboarded, daily_goal_minutes: 5, time_zone: "Asia/Ho_Chi_Minh") }
  let(:headers) { auth_headers(user) }
  let!(:words) { create_list(:vocabulary_word, 12) }

  def start = post("/api/v1/learning_sessions", headers: headers, as: :json)

  def review(item, rating, id: SecureRandom.uuid)
    post "/api/v1/reviews", params: { review: { word_id: item["word"]["id"], rating: rating, client_request_id: id, session_item_id: item["id"] } },
                            headers: headers, as: :json
  end

  it "requires authentication" do
    post "/api/v1/learning_sessions"
    expect(response).to have_http_status(:unauthorized)
    post "/api/v1/reviews", params: {}, as: :json
    expect(response).to have_http_status(:unauthorized)
  end

  describe "starting" do
    it "builds a session of new words capped by the daily new-word limit and returns the same open session next time" do
      start
      expect(response).to have_http_status(:created)
      session = json["data"]
      expect(session["items"].map { |i| i["kind"] }.uniq).to eq(%w[new])
      expect(session["total_items"]).to eq(3)
      expect(session["items"].first["word"]).to include("term", "examples")

      start
      expect(response).to have_http_status(:ok)
      expect(json["data"]["id"]).to eq(session["id"])
      expect(LearningSession.count).to eq(1)
    end

    it "puts due reviews first and respects the daily goal for the number of cards" do
      words.each { |w| UserWordProgress.create!(user: user, vocabulary_word: w, due_at: 1.hour.ago, interval_days: 3, reps: 2, state: "review") }
      start
      items = json["data"]["items"]
      expect(items.size).to eq(10) # 5 minutes * 2 cards
      expect(items.map { |i| i["kind"] }.uniq).to eq(%w[review])
    end

    it "does not lose or punish overdue cards after a long break: they stay due and new words pause" do
      words.each { |w| UserWordProgress.create!(user: user, vocabulary_word: w, due_at: 30.days.ago, interval_days: 3, reps: 2, state: "review") }
      create(:vocabulary_word) # a brand-new word
      start
      expect(json["data"]["items"].map { |i| i["kind"] }.uniq).to eq(%w[review])
      expect(UserWordProgress.where(user: user).count).to eq(12)
    end

    it "returns no session when everything is done for now" do
      words.each { |w| UserWordProgress.create!(user: user, vocabulary_word: w, due_at: 5.days.from_now, interval_days: 5, reps: 2, state: "review") }
      start
      expect(response).to have_http_status(:ok)
      expect(json).to include("data" => nil, "reason" => "all_caught_up")
    end

    describe "learning more than the daily limit" do
      def finish_open_session
        LearningSession.where(user: user, status: "in_progress").find_each(&:complete!)
      end

      it "starts an extra session of only new words after the daily ones, as many times as the learner wants" do
        start
        daily = json["data"]["items"]
        finish_open_session
        daily.each { |i| UserWordProgress.create!(user: user, vocabulary_word_id: i["word"]["id"], due_at: 1.day.from_now) }
        post "/api/v1/learning_sessions", params: { extra: 5 }, headers: headers, as: :json
        expect(response).to have_http_status(:created)
        items = json["data"]["items"]
        expect(items.size).to eq(5)
        expect(items.map { |i| i["kind"] }.uniq).to eq(%w[new])

        finish_open_session
        items.each { |i| UserWordProgress.create!(user: user, vocabulary_word_id: i["word"]["id"], due_at: 1.day.from_now) }
        post "/api/v1/learning_sessions", params: { extra: 5 }, headers: headers, as: :json
        expect(json["data"]["items"].size).to eq(4) # 12 words - 3 daily - 5 extra
      end

      it "offers extra new words even while reviews are waiting (the learner chose to)" do
        words.first(10).each { |w| UserWordProgress.create!(user: user, vocabulary_word: w, due_at: 2.days.ago, interval_days: 1, state: "review") }
        post "/api/v1/learning_sessions", params: { extra: 10 }, headers: headers, as: :json
        expect(json["data"]["items"].map { |i| i["kind"] }.uniq).to eq(%w[new])
        expect(json["data"]["items"].size).to eq(2)
      end

      it "ignores unsupported extra sizes and builds the normal session" do
        post "/api/v1/learning_sessions", params: { extra: 999 }, headers: headers, as: :json
        expect(json["data"]["total_items"]).to eq(3)
      end

      it "uses the learner's own new-words-per-day setting" do
        user.update!(daily_goal_minutes: 15, new_words_per_day: 20)
        start
        expect(json["data"]["total_items"]).to eq(12) # all 12 words fit in 15 min * 2 = 30 cards
        patch "/api/v1/me", params: { user: { new_words_per_day: 500 } }, headers: headers, as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    it "mixes topics in a session instead of taking one topic first" do
      VocabularyWord.delete_all
      it_words = create(:vocabulary_category, name: "IT", slug: "it-words")
      daily = create(:vocabulary_category, name: "Daily", slug: "daily-words")
      3.times { |i| create(:vocabulary_word, term: "it#{i}", vocabulary_category: it_words) }
      3.times { |i| create(:vocabulary_word, term: "daily#{i}", vocabulary_category: daily) }
      post "/api/v1/learning_sessions", params: { extra: 5 }, headers: headers, as: :json
      cats = json["data"]["items"].map { |i| i["word"]["term"].start_with?("it") ? "it" : "daily" }
      expect(cats.first(4).tally).to eq("it" => 2, "daily" => 2)
    end

    it "never offers draft words" do
      VocabularyWord.update_all(status: "draft")
      start
      expect(json["data"]).to be_nil
    end
  end

  describe "reviewing" do
    before { start }
    let(:item) { json["data"]["items"].first }

    it "records the review, schedules the card and completes the item" do
      review(item, "good")
      expect(response).to have_http_status(:created)
      expect(json["data"]["progress"]).to include("state" => "review", "interval_days" => 1, "reps" => 1)
      expect(json["data"]["session"]["completed_items"]).to eq(1)
      log = ReviewLog.last
      expect(log.state_before["reps"]).to eq(0)
      expect(log.state_after["interval_days"]).to eq(1)
    end

    it "is idempotent: resubmitting the same client_request_id does not write again" do
      id = SecureRandom.uuid
      review(item, "good", id: id)
      review(item, "easy", id: id)
      expect(response).to have_http_status(:ok)
      expect(json["duplicate"]).to be(true)
      expect(json["data"]["review"]["rating"]).to eq("good")
      expect(ReviewLog.count).to eq(1)
      expect(UserWordProgress.find_by(user: user, vocabulary_word_id: item["word"]["id"]).reps).to eq(1)
    end

    it "rejects invalid ratings, unknown words and items belonging to someone else" do
      review(item, "perfect")
      expect(response).to have_http_status(:unprocessable_content)

      post "/api/v1/reviews", params: { review: { word_id: 0, rating: "good", client_request_id: "x1" } }, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)

      other = create(:user, :onboarded)
      post "/api/v1/reviews", params: { review: { word_id: item["word"]["id"], rating: "good", client_request_id: "x2", session_item_id: item["id"] } },
                              headers: auth_headers(other), as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig("error", "code")).to eq("invalid_session_item")
    end

    it "does not let a client submit someone else's request id to read their result" do
      id = SecureRandom.uuid
      review(item, "good", id: id)
      other = create(:user, :onboarded)
      post "/api/v1/reviews", params: { review: { word_id: item["word"]["id"], rating: "good", client_request_id: id } },
                              headers: auth_headers(other), as: :json
      expect(response).to have_http_status(:created)
      expect(ReviewLog.where(client_request_id: id).count).to eq(2)
    end

    it "completes the session when the last item is reviewed" do
      json["data"]["items"].each { |i| review(i, "good") }
      expect(json["data"]["session"]["status"]).to eq("completed")
      start
      # new session only if there is more to do; the new-word cap for the day is already reached
      expect(json["data"]).to be_nil
    end

    it "brings an 'again' card back within the day" do
      review(item, "again")
      expect(UserWordProgress.find_by(vocabulary_word_id: item["word"]["id"]).due_at).to be < 11.minutes.from_now
    end
  end

  describe "review history" do
    it "is immutable in Ruby and in the database" do
      start
      item = json["data"]["items"].first
      review(item, "good")
      log = ReviewLog.last
      expect { log.update!(rating: "easy") }.to raise_error(ActiveRecord::ReadOnlyRecord)
      expect(log.destroy).to be(false)
      expect(ReviewLog.exists?(log.id)).to be(true)
      %w[UPDATE\ review_logs\ SET\ rating='easy' DELETE\ FROM\ review_logs].each do |sql|
        expect { ActiveRecord::Base.transaction(requires_new: true) { ActiveRecord::Base.connection.execute(sql) } }
          .to raise_error(ActiveRecord::StatementInvalid, /immutable/)
      end
    end
  end

  it "reports the number of cards due" do
    UserWordProgress.create!(user: user, vocabulary_word: words.first, due_at: 1.hour.ago, state: "review", interval_days: 2, reps: 1)
    get "/api/v1/reviews/due", headers: headers
    expect(json["data"]["due_count"]).to eq(1)
  end
end
