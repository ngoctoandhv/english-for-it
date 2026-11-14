require "rails_helper"

RSpec.describe "Public content", type: :request do
  let!(:live) { create(:vocabulary_word, term: "commit", status: "published") }
  let!(:draft) { create(:vocabulary_word, term: "secretdraft", status: "draft") }

  before { live.vocabulary_examples.create!(sentence_en: "I commit often.", translation_vi: "Tôi commit thường xuyên.") }

  it "lists published words without signing in and never exposes drafts" do
    get "/api/v1/public/words"
    expect(response).to have_http_status(:ok)
    expect(response.headers["Cache-Control"]).to include("public")
    terms = json["data"].map { |w| w["term"] }
    expect(terms).to include("commit")
    expect(terms).not_to include("secretdraft")
    expect(json["data"].find { |w| w["term"] == "commit" }["example"]).to eq("en" => "I commit often.", "vi" => "Tôi commit thường xuyên.")
  end

  it "returns a small random sample" do
    create_list(:vocabulary_word, 8, status: "published")
    get "/api/v1/public/sample"
    expect(json["data"].size).to eq(5)
    expect(json.to_s).not_to include("secretdraft")
  end

  it "carries no user data or ids beyond the word" do
    get "/api/v1/public/words"
    expect(json["data"].first.keys).to match_array(%w[id term ipa part_of_speech meaning_vi definition_en example])
  end
end
