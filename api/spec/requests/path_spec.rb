require "rails_helper"

RSpec.describe "Learning path", type: :request do
  let(:user) { create(:user, :onboarded, level: "elementary") }
  let(:headers) { auth_headers(user) }
  let!(:first) { create(:path_unit, title: "First", position: 0) }
  let!(:second) { create(:path_unit, title: "Second", position: 1) }
  let!(:advanced) { create(:path_unit, title: "Advanced", level: "intermediate", position: 2) }

  def overview
    get "/api/v1/path", headers: headers
    json["data"]
  end

  def unit(slug) = overview["levels"].flat_map { |l| l["units"] }.find { |u| u["slug"] == slug }

  def review_all(words)
    words.each { |w| ReviewLog.create!(user: user, vocabulary_word: w, rating: "good", client_request_id: SecureRandom.uuid, reviewed_at: Time.current) }
  end

  def complete_unit(u)
    review_all(u.collection_word_ids.map { |id| VocabularyWord.find(id) })
    lesson = u.path_steps.find_by(kind: "listening").listening_lesson
    user.listening_attempts.create!(listening_lesson: lesson, score: 2, total: 2, answers: [], completed_at: Time.current)
    scenario = u.path_steps.find_by(kind: "scenario").it_scenario
    ScenarioProgress.create!(user: user, it_scenario: scenario, last_position: 2, completed_at: Time.current)
    user.unit_quiz_results.create!(path_unit: u, score: 7, total: 8, created_at: Time.current)
    Path::Completions.sync!(user)
  end

  it "requires authentication" do
    get "/api/v1/path"
    expect(response).to have_http_status(:unauthorized)
  end

  it "shows only published units and starts with the first unit available and the rest locked" do
    create(:path_unit, title: "Hidden", status: "draft", position: 9)
    data = overview
    expect(data["start_level"]).to eq("elementary")
    slugs = data["levels"].flat_map { |l| l["units"] }.map { |u| u["slug"] }
    expect(slugs).to eq(%w[first second advanced])
    expect(unit("first")["status"]).to eq("available")
    expect(unit("second")["status"]).to eq("locked")
    expect(unit("advanced")["status"]).to eq("locked")
    expect(data["next_up"]).to include("unit" => "first")
    expect(data["next_up"]["step"]["kind"]).to eq("words")
  end

  it "tracks step progress from real learning facts" do
    words = first.collection_word_ids.first(4).map { |id| VocabularyWord.find(id) }
    review_all(words)
    u = unit("first")
    expect(u["status"]).to eq("in_progress")
    words_step = u["steps"].first
    expect(words_step).to include("kind" => "words", "done" => 4, "total" => 5, "complete" => true) # 80% is enough
    expect(u["next_step"]["kind"]).to eq("listening")
  end

  it "requires a passing listening score and a completed scenario" do
    lesson = first.path_steps.find_by(kind: "listening").listening_lesson
    user.listening_attempts.create!(listening_lesson: lesson, score: 1, total: 3, answers: [], completed_at: Time.current)
    expect(unit("first")["steps"][1]["complete"]).to be(false)
    user.listening_attempts.create!(listening_lesson: lesson, score: 2, total: 3, answers: [], completed_at: Time.current)
    expect(unit("first")["steps"][1]["complete"]).to be(true)
  end

  it "unlocks the next unit only when the previous one is complete, and keeps completion forever" do
    complete_unit(first)
    expect(unit("first")["status"]).to eq("completed")
    expect(unit("second")["status"]).to eq("available")
    expect(user.unit_completions.count).to eq(1)

    # editing the unit later (adding a step) never takes completion away
    first.path_steps.create!(position: 9, kind: "scenario", it_scenario: create(:it_scenario))
    expect(unit("first")["status"]).to eq("completed")
  end

  it "opens the next level only after every unit of the previous level is complete" do
    complete_unit(first)
    complete_unit(second)
    expect(unit("advanced")["status"]).to eq("available")
  end

  it "unlocks lower levels for a learner who starts higher" do
    user.update!(level: "intermediate")
    expect(unit("first")["status"]).to eq("available")
    expect(unit("second")["status"]).to eq("available")
    expect(unit("advanced")["status"]).to eq("available")
    expect(overview["start_level"]).to eq("intermediate")
  end

  it "drops steps whose content is no longer published" do
    first.path_steps.find_by(kind: "scenario").it_scenario.update!(status: "draft")
    expect(unit("first")["steps"].map { |s| s["kind"] }).to eq(%w[words listening quiz])
  end

  it "returns one unit by slug and 404 for unknown or draft units" do
    get "/api/v1/path/units/first", headers: headers
    expect(json["data"]["title"]).to eq("First")
    get "/api/v1/path/units/nope", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  describe "unit quiz" do
    it "builds questions only from the unit's words, with no answer key" do
      get "/api/v1/path/units/first/quiz", headers: headers
      questions = json["data"]["questions"]
      expect(questions.size).to eq(5)
      expect(questions.map { |q| q["word_id"] }).to all(be_in(first.collection_word_ids))
      expect(questions.first.keys).not_to include("correct")
    end

    it "grades on the server, saves the best result, completes the unit and reports XP" do
      user_words = first.collection_word_ids.map { |id| VocabularyWord.find(id) }
      review_all(user_words.first(4))
      lesson = first.path_steps.find_by(kind: "listening").listening_lesson
      user.listening_attempts.create!(listening_lesson: lesson, score: 3, total: 3, answers: [], completed_at: Time.current)
      ScenarioProgress.create!(user: user, it_scenario: first.path_steps.find_by(kind: "scenario").it_scenario, last_position: 2, completed_at: Time.current)

      answers = user_words.map { |w| { word_id: w.id, choice_word_id: w.id } }
      post "/api/v1/path/units/first/quiz/answers", params: { answers: answers }, headers: headers, as: :json
      data = json["data"]
      expect(data).to include("score" => 5, "total" => 5, "saved" => true, "passed" => true)
      expect(data["units_completed"].map { |u| u["slug"] }).to eq([ "first" ])
      expect(data["xp_gained"]).to be >= Growth::Xp::PER_UNIT
      expect(unit("second")["status"]).to eq("available")
    end

    it "does not count a failed quiz and ignores words outside the unit" do
      words = first.collection_word_ids.map { |id| VocabularyWord.find(id) }
      outsider = create(:vocabulary_word)
      answers = words.map { |w| { word_id: w.id, choice_word_id: outsider.id } } + [ { word_id: outsider.id, choice_word_id: outsider.id } ]
      post "/api/v1/path/units/first/quiz/answers", params: { answers: answers }, headers: headers, as: :json
      expect(json["data"]).to include("score" => 0, "total" => 5, "passed" => false)
      expect(user.unit_completions).to be_empty
    end

    it "does not save a result for too few answers" do
      w = VocabularyWord.find(first.collection_word_ids.first)
      post "/api/v1/path/units/first/quiz/answers", params: { answers: [ { word_id: w.id, choice_word_id: w.id } ] }, headers: headers, as: :json
      expect(json["data"]["saved"]).to be(false)
      expect(user.unit_quiz_results).to be_empty
    end
  end

  describe "focused sessions" do
    it "puts the collection's words first, in collection order" do
      other = create(:vocabulary_word, term: "aaa-other")
      collection = first.path_steps.find_by(kind: "words").learning_collection
      post "/api/v1/learning_sessions", params: { collection: collection.slug }, headers: headers, as: :json
      terms = json["data"]["items"].map { |i| i["word"]["id"] }
      expect(terms).to eq(collection.collection_words.order(:position).limit(terms.size).pluck(:vocabulary_word_id))
      expect(terms).not_to include(other.id)
    end
  end
end
