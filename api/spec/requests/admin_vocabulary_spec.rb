require "rails_helper"

RSpec.describe "Admin vocabulary", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:learner) { create(:user) }
  let(:payload) do
    { word: { term: "rebase", part_of_speech: "verb", meaning_vi: "viết lại lịch sử commit", definition_en: "To move commits onto a new base.",
              status: "draft",
              vocabulary_examples_attributes: [ { sentence_en: "Rebase onto main.", translation_vi: "Rebase lên main." } ],
              vocabulary_collocations_attributes: [ { phrase: "rebase onto" } ] } }
  end

  it "forbids learners and rejects anonymous requests" do
    get "/api/v1/admin/words"
    expect(response).to have_http_status(:unauthorized)
    %i[get post].each do |verb|
      public_send(verb, "/api/v1/admin/words", params: payload, headers: auth_headers(learner), as: :json)
      expect(response).to have_http_status(:forbidden)
    end
    delete "/api/v1/admin/words/1", headers: auth_headers(learner)
    expect(response).to have_http_status(:forbidden)
  end

  it "creates, updates, lists drafts and deletes a word with nested examples" do
    post "/api/v1/admin/words", params: payload, headers: auth_headers(admin), as: :json
    expect(response).to have_http_status(:created)
    id = json["data"]["id"]
    expect(json["data"]["examples"].size).to eq(1)

    patch "/api/v1/admin/words/#{id}", params: { word: { status: "published",
          vocabulary_examples_attributes: [ { id: json["data"]["examples"][0]["id"], _destroy: true } ] } },
          headers: auth_headers(admin), as: :json
    expect(json["data"]["status"]).to eq("published")
    expect(json["data"]["examples"]).to be_empty

    get "/api/v1/admin/words", params: { status: "published" }, headers: auth_headers(admin)
    expect(json["data"].map { |w| w["id"] }).to eq([ id ])

    delete "/api/v1/admin/words/#{id}", headers: auth_headers(admin)
    expect(response).to have_http_status(:no_content)
  end

  it "validates input and rejects duplicates" do
    create(:vocabulary_word, term: "rebase", part_of_speech: "verb")
    post "/api/v1/admin/words", params: payload, headers: auth_headers(admin), as: :json
    expect(response).to have_http_status(:unprocessable_content)
    expect(json.dig("error", "details")).to have_key("term")

    post "/api/v1/admin/words", params: { word: { term: "x", part_of_speech: "wizard", status: "nope" } }, headers: auth_headers(admin), as: :json
    expect(json.dig("error", "details").keys).to include("part_of_speech", "status", "meaning_vi")
  end

  it "uploads audio but rejects non-audio files" do
    word = create(:vocabulary_word)
    good = Rack::Test::UploadedFile.new(StringIO.new("RIFFfake"), "audio/mpeg", original_filename: "a.mp3")
    post "/api/v1/admin/words/#{word.id}/audio", params: { audio: good }, headers: auth_headers(admin)
    expect(response).to have_http_status(:ok)
    expect(json["data"]["audio_url"]).to include("/rails/active_storage/")

    bad = Rack::Test::UploadedFile.new(StringIO.new("hello"), "text/plain", original_filename: "a.txt")
    other = create(:vocabulary_word)
    post "/api/v1/admin/words/#{other.id}/audio", params: { audio: bad }, headers: auth_headers(admin)
    expect(response).to have_http_status(:unprocessable_content)
  end

  it "manages categories and collections with ordered words, and blocks deleting a used category" do
    post "/api/v1/admin/categories", params: { category: { name: "Git & VCS" } }, headers: auth_headers(admin), as: :json
    expect(json["data"]["slug"]).to eq("git-vcs")
    cat_id = json["data"]["id"]
    w1 = create(:vocabulary_word, vocabulary_category_id: cat_id)
    w2 = create(:vocabulary_word)

    post "/api/v1/admin/collections", params: { collection: { title: "Standup", status: "published", word_ids: [ w2.id, w1.id ] } },
                                      headers: auth_headers(admin), as: :json
    expect(json["data"]["word_ids"]).to eq([ w2.id, w1.id ])

    delete "/api/v1/admin/categories/#{cat_id}", headers: auth_headers(admin)
    expect(response).to have_http_status(:conflict)
  end
end
