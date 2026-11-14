require "rails_helper"

RSpec.describe "Dashboard, progress and quiz", type: :request do
  let(:user) { create(:user, :onboarded, daily_goal_minutes: 5, time_zone: "Asia/Ho_Chi_Minh") }
  let(:headers) { auth_headers(user) }
  let!(:words) { create_list(:vocabulary_word, 8) }

  def progress_for(word, **attrs)
    UserWordProgress.create!({ user: user, vocabulary_word: word, due_at: 1.hour.ago, interval_days: 2, reps: 1, state: "review" }.merge(attrs))
  end

  it "requires authentication" do
    %w[/api/v1/dashboard /api/v1/progress /api/v1/history /api/v1/quizzes/quick].each do |path|
      get path
      expect(response).to have_http_status(:unauthorized), path
    end
  end

  describe "GET /dashboard" do
    it "offers a first session to a brand-new learner" do
      get "/api/v1/dashboard", headers: headers
      expect(json["data"]).to include("due_count" => 0, "new_available" => 3, "can_start" => true, "backlog" => false, "words_started" => 0)
    end

    it "shows due cards and pauses new words during a backlog, without any penalty fields" do
      words.each { |w| progress_for(w, due_at: 20.days.ago) }
      get "/api/v1/dashboard", headers: headers
      expect(json["data"]).to include("due_count" => 8, "backlog" => false, "can_start" => true)
      create_list(:vocabulary_word, 5).each { |w| progress_for(w, due_at: 20.days.ago) }
      get "/api/v1/dashboard", headers: headers
      expect(json["data"]).to include("backlog" => true, "new_available" => 0)
      expect(json["data"].keys).not_to include("streak", "missed_days")
    end

    it "reports nothing to do when everything is scheduled for later" do
      VocabularyWord.find_each { |w| progress_for(w, due_at: 3.days.from_now) }
      get "/api/v1/dashboard", headers: headers
      expect(json["data"]).to include("can_start" => false, "due_count" => 0)
    end

    it "counts reviews per local day, not per UTC day" do
      # 20:00 UTC on Jan 1 is 03:00 on Jan 2 in Ho Chi Minh City
      travel_to Time.utc(2026, 1, 2, 5, 0) do
        ReviewLog.create!(user: user, vocabulary_word: words.first, rating: "good", client_request_id: "a", reviewed_at: Time.utc(2026, 1, 1, 20, 0))
        get "/api/v1/progress", headers: headers
        by_day = json["data"]["by_day"]
        expect(by_day.last).to eq("date" => "2026-01-02", "reviews" => 1)
        expect(by_day[-2]["reviews"]).to eq(0)
      end
    end
  end

  describe "vocabulary strength on the dashboard" do
    it "splits published words into disjoint stages by interval" do
      progress_for(words[0], interval_days: 0, state: "learning")
      progress_for(words[1], interval_days: 2)
      progress_for(words[2], interval_days: 4)
      progress_for(words[3], interval_days: 9)
      progress_for(words[4], interval_days: 40)
      get "/api/v1/dashboard", headers: headers
      expect(json["data"]["vocabulary"]).to eq(
        "total" => 8, "unseen" => 3, "learning" => 1, "familiar" => 2, "solid" => 1, "mastered" => 1, "solid_soon" => 1
      )
    end
  end

  describe "GET /progress and /history" do
    it "summarises word strength and accuracy" do
      progress_for(words[0], interval_days: 0, state: "learning")
      progress_for(words[1], interval_days: 5)
      progress_for(words[2], interval_days: 30)
      %w[good again good good].each_with_index do |r, i|
        ReviewLog.create!(user: user, vocabulary_word: words[0], rating: r, client_request_id: "r#{i}", reviewed_at: Time.current)
      end
      get "/api/v1/progress", headers: headers
      expect(json["data"]["words"]).to eq("started" => 3, "learning" => 1, "young" => 1, "mature" => 1)
      expect(json["data"]["reviews"]).to eq("total" => 4, "accuracy" => 75)
      expect(json["data"]["by_day"].size).to eq(14)
    end

    it "pages through the user's own history only" do
      3.times { |i| ReviewLog.create!(user: user, vocabulary_word: words[i], rating: "good", client_request_id: "h#{i}", reviewed_at: i.minutes.ago) }
      other = create(:user)
      ReviewLog.create!(user: other, vocabulary_word: words[0], rating: "easy", client_request_id: "o1", reviewed_at: Time.current)
      get "/api/v1/history", params: { per_page: 2 }, headers: headers
      expect(json["data"].size).to eq(2)
      expect(json["meta"]).to include("total" => 3, "total_pages" => 2)
      expect(json["data"].first["word"]["term"]).to eq(words[0].term)
    end
  end

  describe "quick quiz" do
    it "builds questions with the right word among four distinct options and never leaks the answer key" do
      get "/api/v1/quizzes/quick", params: { count: 5 }, headers: headers
      questions = json["data"]["questions"]
      expect(questions.size).to eq(5)
      questions.each do |q|
        expect(q["options"].size).to eq(4)
        expect(q["options"].map { |o| o["word_id"] }.uniq.size).to eq(4)
        expect(q["options"].map { |o| o["word_id"] }).to include(q["word_id"])
        expect(q).not_to have_key("correct")
      end
    end

    it "returns no questions when there are too few published words" do
      VocabularyWord.where.not(id: words.first(3).map(&:id)).delete_all
      get "/api/v1/quizzes/quick", headers: headers
      expect(json["data"]["questions"]).to eq([])
    end

    it "grades answers on the server" do
      a, b = words
      post "/api/v1/quizzes/quick/answers",
           params: { answers: [ { word_id: a.id, choice_word_id: a.id }, { word_id: b.id, choice_word_id: a.id } ] }, headers: headers, as: :json
      expect(json["data"]).to include("score" => 1, "total" => 2)
      expect(json["data"]["results"].map { |r| r["correct"] }).to eq([ true, false ])
    end

    it "does not change the review schedule" do
      a = words.first
      expect {
        post "/api/v1/quizzes/quick/answers", params: { answers: [ { word_id: a.id, choice_word_id: a.id } ] }, headers: headers, as: :json
      }.not_to change { [ ReviewLog.count, UserWordProgress.count ] }
    end

    it "ignores unknown and draft words and bounds the number of answers" do
      draft = create(:vocabulary_word, :draft)
      post "/api/v1/quizzes/quick/answers", params: { answers: [ { word_id: draft.id, choice_word_id: draft.id }, { word_id: 0, choice_word_id: 0 } ] }, headers: headers, as: :json
      expect(json["data"]["total"]).to eq(0)
      many = Array.new(21) { { word_id: words.first.id, choice_word_id: words.first.id } }
      post "/api/v1/quizzes/quick/answers", params: { answers: many }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end

RSpec.describe "Quick quiz modes", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:headers) { auth_headers(user) }
  let!(:words) { create_list(:vocabulary_word, 6) }

  it "builds listening questions with four spelled options and no term in the payload when a recording exists" do
    word = words.first
    word.audio.attach(io: StringIO.new("RIFFfake"), filename: "a.mp3", content_type: "audio/mpeg")
    get "/api/v1/quizzes/quick", params: { mode: "listen", count: 6 }, headers: headers
    questions = json["data"]["questions"]
    expect(questions.map { |q| q["mode"] }.uniq).to eq(%w[listen])
    with_audio = questions.find { |q| q["word_id"] == word.id }
    expect(with_audio["audio_url"]).to be_present
    expect(with_audio["speak_text"]).to be_nil
    expect(with_audio["options"].size).to eq(4)
  end

  it "builds typing questions from the definition without revealing the word" do
    get "/api/v1/quizzes/quick", params: { mode: "type", count: 3 }, headers: headers
    q = json["data"]["questions"].first
    expect(q).to include("mode" => "type", "definition_en" => "A simple definition.")
    expect(q.keys).not_to include("term")
    expect(q["length"]).to be > 0
  end

  it "grades typed answers tolerantly and flags near misses" do
    w = create(:vocabulary_word, term: "pull request")
    answer = ->(text) { post "/api/v1/quizzes/quick/answers", params: { answers: [ { word_id: w.id, text: text } ] }, headers: headers, as: :json; json["data"]["results"].first }
    expect(answer.call("Pull-Request")).to include("correct" => true)
    expect(answer.call(" pull requests ")).to include("correct" => true)
    expect(answer.call("pull requst")).to include("correct" => false, "close" => true, "correct_term" => "pull request")
    expect(answer.call("merge")).to include("correct" => false, "close" => false)
    expect(answer.call("")).to include("correct" => false)
  end

  describe "cloze mode" do
    let!(:deploy) do
      create(:vocabulary_word, term: "deploy").tap do |w|
        w.vocabulary_examples.create!(sentence_en: "We deployed the app on Friday.", translation_vi: "Chúng tôi đã triển khai ứng dụng vào thứ Sáu.")
      end
    end

    it "blanks the word as it appears in its own example and does not leak it" do
      get "/api/v1/quizzes/quick", params: { mode: "cloze", count: 7 }, headers: headers
      q = json["data"]["questions"].find { |x| x["word_id"] == deploy.id }
      expect(q).to include("mode" => "cloze", "sentence" => "We _____ the app on Friday.", "length" => 8, "first_letter" => "d")
      expect(q.to_s).not_to include("deployed")
    end

    it "falls back to a definition question when a word has no usable example" do
      get "/api/v1/quizzes/quick", params: { mode: "cloze", count: 7 }, headers: headers
      other = json["data"]["questions"].find { |x| x["word_id"] != deploy.id }
      expect(other["mode"]).to eq("type")
    end

    it "accepts the inflected form and the base term" do
      answer = ->(text) { post "/api/v1/quizzes/quick/answers", params: { answers: [ { word_id: deploy.id, text: text } ] }, headers: headers, as: :json; json["data"]["results"].first }
      expect(answer.call("deployed")).to include("correct" => true)
      expect(answer.call("deploy")).to include("correct" => true)
      expect(answer.call("deployd")).to include("correct" => false, "close" => true)
    end
  end

  it "falls back to choice mode for unknown modes" do
    get "/api/v1/quizzes/quick", params: { mode: "hack" }, headers: headers
    expect(json["data"]["questions"].first["mode"]).to eq("choice")
  end
end
