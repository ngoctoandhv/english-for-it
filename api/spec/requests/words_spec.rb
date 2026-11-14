require "rails_helper"

RSpec.describe "Vocabulary (learner API)", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:category) { create(:vocabulary_category, name: "Git") }

  it "requires authentication" do
    get "/api/v1/words"
    expect(response).to have_http_status(:unauthorized)
  end

  it "lists only published words, filters, searches and paginates" do
    create(:vocabulary_word, term: "commit", vocabulary_category: category, meaning_vi: "ghi lại thay đổi")
    create(:vocabulary_word, term: "branch", vocabulary_category: category)
    create(:vocabulary_word, term: "secret", vocabulary_category: category, status: "draft")
    create(:vocabulary_word, term: "deploy")

    get "/api/v1/words", params: { category: "git", per_page: 1 }, headers: auth_headers(user)
    expect(json["data"].size).to eq(1)
    expect(json["meta"]).to include("total" => 2, "total_pages" => 2)

    get "/api/v1/words", params: { q: "ghi lại" }, headers: auth_headers(user)
    expect(json["data"].map { |w| w["term"] }).to eq(%w[commit])

    get "/api/v1/words", headers: auth_headers(user)
    expect(json["data"].map { |w| w["term"] }).not_to include("secret")
  end

  it "does not run a query per word (no N+1)" do
    create_list(:vocabulary_word, 3, vocabulary_category: category)
    get "/api/v1/words", headers: auth_headers(user) # warm up
    count = 0
    sub = ActiveSupport::Notifications.subscribe("sql.active_record") { |*, p| count += 1 unless p[:name] == "SCHEMA" }
    get "/api/v1/words", headers: auth_headers(user)
    small = count
    create_list(:vocabulary_word, 5, vocabulary_category: category)
    count = 0
    get "/api/v1/words", headers: auth_headers(user)
    ActiveSupport::Notifications.unsubscribe(sub)
    expect(count).to eq(small)
  end

  it "shows a word with examples and collocations, but hides drafts" do
    word = create(:vocabulary_word)
    word.vocabulary_examples.create!(sentence_en: "I commit.", translation_vi: "Tôi commit.")
    word.vocabulary_collocations.create!(phrase: "commit changes")
    get "/api/v1/words/#{word.id}", headers: auth_headers(user)
    expect(json["data"]["examples"].size).to eq(1)
    expect(json["data"]["collocations"].first["phrase"]).to eq("commit changes")

    draft = create(:vocabulary_word, :draft)
    get "/api/v1/words/#{draft.id}", headers: auth_headers(user)
    expect(response).to have_http_status(:not_found)
  end

  it "filters by collection in collection order" do
    a = create(:vocabulary_word, term: "a")
    b = create(:vocabulary_word, term: "b")
    col = create(:learning_collection, slug: "standup")
    col.replace_words!([ b.id, a.id ])
    get "/api/v1/words", params: { collection: "standup" }, headers: auth_headers(user)
    expect(json["data"].map { |w| w["term"] }).to eq(%w[b a])
    get "/api/v1/collections/standup", headers: auth_headers(user)
    expect(json["data"]["words"].map { |w| w["term"] }).to eq(%w[b a])
  end

  it "adds, lists and removes favorites idempotently and only for the current user" do
    word = create(:vocabulary_word)
    2.times { post "/api/v1/favorites", params: { type: "word", id: word.id }, headers: auth_headers(user), as: :json }
    expect(UserFavorite.count).to eq(1)

    get "/api/v1/words", headers: auth_headers(user)
    expect(json["data"].first["favorited"]).to be(true)
    other = create(:user)
    get "/api/v1/favorites", headers: auth_headers(other)
    expect(json["data"]).to be_empty

    delete "/api/v1/favorites/word/#{word.id}", headers: auth_headers(user)
    expect(response).to have_http_status(:no_content)
    expect(UserFavorite.count).to eq(0)

    post "/api/v1/favorites", params: { type: "bogus", id: 1 }, headers: auth_headers(user), as: :json
    expect(response).to have_http_status(:not_found)
  end

  it "filters the library by CEFR level" do
    create(:vocabulary_word, term: "hello", cefr_level: "a1")
    create(:vocabulary_word, term: "idempotent", cefr_level: "b2")
    get "/api/v1/words", params: { level: "A1" }, headers: auth_headers(create(:user, :onboarded))
    expect(json["data"].map { |w| w["term"] }).to eq([ "hello" ])
  end
end
