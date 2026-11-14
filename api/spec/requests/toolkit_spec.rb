require "rails_helper"

RSpec.describe "Toolkit phrases", type: :request do
  let(:user) { create(:user, :onboarded) }
  let(:admin) { create(:user, :admin) }

  def phrase(**attrs) = ToolkitPhrase.create!({ category: "standup", text_en: "I have no blockers.", text_vi: "Không có vấn đề.", status: "published" }.merge(attrs))

  it "requires authentication" do
    get "/api/v1/toolkit/phrases"
    expect(response).to have_http_status(:unauthorized)
  end

  it "lists published phrases in order, filters by category and ignores unknown categories" do
    phrase(text_en: "B", position: 1)
    phrase(text_en: "A", position: 0)
    phrase(category: "email", text_en: "Hi")
    phrase(text_en: "hidden", status: "draft")
    get "/api/v1/toolkit/phrases", params: { category: "standup" }, headers: auth_headers(user)
    expect(json["data"].map { |p| p["text_en"] }).to eq(%w[A B])
    expect(json["data"].first.keys).to contain_exactly("id", "category", "text_en", "text_vi", "audio_url")

    get "/api/v1/toolkit/phrases", params: { category: "nope" }, headers: auth_headers(user)
    expect(json["data"].size).to eq(3)
  end

  it "does not run a query per phrase" do
    phrase
    get "/api/v1/toolkit/phrases", headers: auth_headers(user)
    small = count_queries { get "/api/v1/toolkit/phrases", headers: auth_headers(user) }
    5.times { |i| phrase(text_en: "p#{i}") }
    expect(count_queries { get "/api/v1/toolkit/phrases", headers: auth_headers(user) }).to eq(small)
  end

  describe "admin" do
    let(:payload) { { phrase: { category: "email", text_en: "Best regards,", text_vi: "Trân trọng,", status: "draft" } } }

    it "is forbidden to learners" do
      post "/api/v1/admin/phrases", params: payload, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "creates, validates and uploads audio" do
      post "/api/v1/admin/phrases", params: payload, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:created)
      id = json["data"]["id"]

      post "/api/v1/admin/phrases", params: { phrase: { category: "bogus", text_en: "x", text_vi: "y" } }, headers: auth_headers(admin), as: :json
      expect(response).to have_http_status(:unprocessable_content)

      good = Rack::Test::UploadedFile.new(StringIO.new("RIFFfake"), "audio/mpeg", original_filename: "a.mp3")
      post "/api/v1/admin/phrases/#{id}/audio", params: { audio: good }, headers: auth_headers(admin)
      expect(json["data"]["audio_url"]).to include("/rails/active_storage/")
    end
  end
end
