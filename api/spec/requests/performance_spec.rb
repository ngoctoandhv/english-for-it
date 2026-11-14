require "rails_helper"

# Each endpoint must issue the same number of queries whether it returns 2 records or 8 (no N+1).
RSpec.describe "Query counts stay flat as data grows", type: :request do
  let(:user) { create(:user, :onboarded, daily_goal_minutes: 15) }
  let(:admin) { create(:user, :admin) }

  def flat?(path, headers:, grow:)
    get path, headers: headers # warm up (loads schema caches)
    before = count_queries { get path, headers: headers }
    grow.call
    after = count_queries { get path, headers: headers }
    expect(response).to have_http_status(:ok)
    expect(after).to eq(before), "#{path}: #{before} queries with few records, #{after} with more"
  end

  it "GET /words, /categories, /collections/:slug, /favorites" do
    cat = create(:vocabulary_category)
    col = create(:learning_collection, slug: "c")
    seed = lambda do |n|
      words = create_list(:vocabulary_word, n, vocabulary_category: cat)
      words.each { |w| w.vocabulary_examples.create!(sentence_en: "a", translation_vi: "b"); user.user_favorites.create!(favoritable: w) }
      col.replace_words!(col.vocabulary_words.pluck(:id) + words.map(&:id))
    end
    seed.call(2)
    %w[/api/v1/words /api/v1/categories /api/v1/collections/c /api/v1/favorites].each do |path|
      flat?(path, headers: auth_headers(user), grow: -> { seed.call(6) })
    end
  end

  it "GET /listening_lessons and /scenarios" do
    grow = lambda do |n|
      create_list(:listening_lesson, n)
      create_list(:it_scenario, n)
    end
    grow.call(2)
    flat?("/api/v1/listening_lessons", headers: auth_headers(user), grow: -> { grow.call(6) })
    flat?("/api/v1/scenarios", headers: auth_headers(user), grow: -> { grow.call(6) })
  end

  it "POST /learning_sessions builds and serialises a session without per-card queries" do
    create_list(:vocabulary_word, 3, vocabulary_category: create(:vocabulary_category)).each { |w| w.vocabulary_examples.create!(sentence_en: "a", translation_vi: "b") }
    post "/api/v1/learning_sessions", headers: auth_headers(user), as: :json
    LearningSession.destroy_all
    small = count_queries { post "/api/v1/learning_sessions", headers: auth_headers(user), as: :json }
    LearningSession.destroy_all
    create_list(:vocabulary_word, 10, vocabulary_category: create(:vocabulary_category)).each { |w| w.vocabulary_examples.create!(sentence_en: "a", translation_vi: "b") }
    large = count_queries { post "/api/v1/learning_sessions", headers: auth_headers(user), as: :json }
    expect(json["data"]["items"].size).to be > 5
    # Inserting one item row per card is expected; reads must not scale: allow at most 3 extra queries per added card.
    expect(large - small).to be <= (json["data"]["items"].size - 3) * 3
  end

  it "GET /admin/words, /admin/listening, /admin/scenarios" do
    grow = lambda do |n|
      create_list(:vocabulary_word, n, vocabulary_category: create(:vocabulary_category))
      create_list(:listening_lesson, n)
      create_list(:it_scenario, n)
    end
    grow.call(2)
    %w[/api/v1/admin/words /api/v1/admin/listening /api/v1/admin/scenarios].each do |path|
      flat?(path, headers: auth_headers(admin), grow: -> { grow.call(6) })
    end
  end

  it "GET /history" do
    words = create_list(:vocabulary_word, 8)
    log = ->(w) { ReviewLog.create!(user: user, vocabulary_word: w, rating: "good", client_request_id: SecureRandom.uuid, reviewed_at: Time.current) }
    words.first(2).each(&log)
    flat?("/api/v1/history", headers: auth_headers(user), grow: -> { words.last(6).each(&log) })
  end

  it "GET /path and /growth" do
    create_list(:path_unit, 2)
    grow = -> { create_list(:path_unit, 4) }
    flat?("/api/v1/path", headers: auth_headers(user), grow: grow)
    flat?("/api/v1/growth", headers: auth_headers(user), grow: -> { create_list(:path_unit, 2) })
  end
end
