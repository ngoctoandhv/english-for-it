require "rails_helper"

RSpec.describe "Listening", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:admin) { create(:user, :admin) }
  let!(:lesson) { create(:listening_lesson, level: "a2") }

  it "requires authentication" do
    get "/api/v1/listening_lessons"
    expect(response).to have_http_status(:unauthorized)
  end

  it "lists only published lessons with question counts" do
    create(:listening_lesson, status: "draft", title: "Hidden")
    get "/api/v1/listening_lessons", headers: auth_headers(user)
    expect(json["data"].map { |l| l["title"] }).to eq([ lesson.title ])
    expect(json["data"].first).to include("questions_count" => 2, "best_score" => nil)
  end

  it "shows a lesson with questions but never the answer key" do
    get "/api/v1/listening_lessons/#{lesson.id}", headers: auth_headers(user)
    expect(json["data"]["transcript_en"]).to be_present
    expect(json["data"]["questions"].first.keys).to contain_exactly("id", "prompt", "choices")
    expect(response.body).not_to include("correct_index", "because")
  end

  it "hides draft lessons" do
    draft = create(:listening_lesson, status: "draft")
    get "/api/v1/listening_lessons/#{draft.id}", headers: auth_headers(user)
    expect(response).to have_http_status(:not_found)
  end

  describe "attempts" do
    let(:q1) { lesson.listening_questions.first }
    let(:q2) { lesson.listening_questions.last }

    it "grades on the server, stores the attempt and returns explanations" do
      post "/api/v1/listening_lessons/#{lesson.id}/attempts",
           params: { answers: [ { question_id: q1.id, choice_index: 1 }, { question_id: q2.id, choice_index: 1 } ] }, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:created)
      expect(json["data"]).to include("score" => 1, "total" => 2)
      expect(json["data"]["results"].first).to include("correct" => true, "explanation" => "because")
      expect(user.listening_attempts.count).to eq(1)

      get "/api/v1/listening_lessons", headers: auth_headers(user)
      expect(json["data"].first["best_score"]).to eq(1)
    end

    it "counts unanswered and out-of-range choices as wrong and ignores foreign question ids" do
      other = create(:listening_lesson)
      post "/api/v1/listening_lessons/#{lesson.id}/attempts",
           params: { answers: [ { question_id: q1.id, choice_index: 99 }, { question_id: other.listening_questions.first.id, choice_index: 1 } ] },
           headers: auth_headers(user), as: :json
      expect(json["data"]).to include("score" => 0, "total" => 2)
    end

    it "keeps attempts private to each user" do
      post "/api/v1/listening_lessons/#{lesson.id}/attempts", params: { answers: [ { question_id: q1.id, choice_index: 1 } ] }, headers: auth_headers(user), as: :json
      get "/api/v1/listening_lessons", headers: auth_headers(create(:user))
      expect(json["data"].first["best_score"]).to be_nil
    end
  end

  describe "admin" do
    let(:payload) do
      { listening: { title: "New lesson", level: "b1", transcript_en: "Hello there.", status: "draft",
                     listening_questions_attributes: [ { prompt: "Greeting?", choices: [ "Hello", "Bye" ], correct_index: 0 } ] } }
    end

    it "is forbidden to learners" do
      post "/api/v1/admin/listening", params: payload, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "creates a lesson with questions (answer key visible to admins only) and validates choices" do
      post "/api/v1/admin/listening", params: payload, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:created)
      expect(json["data"]["questions"].first).to include("correct_index" => 0)

      bad = payload.deep_dup
      bad[:listening][:title] = "Bad"
      bad[:listening][:listening_questions_attributes] = [ { prompt: "?", choices: [ "only one" ], correct_index: 3 } ]
      post "/api/v1/admin/listening", params: bad, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "uploads audio and rejects non-audio" do
      good = Rack::Test::UploadedFile.new(StringIO.new("RIFFfake"), "audio/mpeg", original_filename: "a.mp3")
      post "/api/v1/admin/listening/#{lesson.id}/audio", params: { audio: good }, headers: auth_headers(admin)
      expect(json["data"]["audio_url"]).to include("/rails/active_storage/")
      bad = Rack::Test::UploadedFile.new(StringIO.new("x"), "text/plain", original_filename: "a.txt")
      post "/api/v1/admin/listening/#{create(:listening_lesson).id}/audio", params: { audio: bad }, headers: auth_headers(admin)
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
