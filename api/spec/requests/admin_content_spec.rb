require "rails_helper"

RSpec.describe "Admin content tools", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:headers) { auth_headers(admin) }
  let(:csv) do
    <<~CSV
      term,part_of_speech,ipa,meaning_vi,definition_en,category,example_en,example_vi,collocations
      sandbox,noun,/ˈsændbɑːks/,môi trường thử nghiệm,A safe place to try things without harming real data.,Testing & QA,We test the change in a sandbox.,Chúng tôi thử thay đổi trong sandbox.,sandbox environment;use a sandbox
      throttle,verb,,giới hạn tốc độ,To slow down or limit how fast something happens.,,,,
    CSV
  end

  def import(text, dry_run: false)
    post "/api/v1/admin/words/import", params: { csv: text, dry_run: dry_run }, headers: headers, as: :json
  end

  describe "word CSV import" do
    it "creates draft words with example, collocations and a new category" do
      import(csv)
      expect(json["data"]).to include("created" => 2, "updated" => 0, "errors" => [])
      word = VocabularyWord.find_by!(term: "sandbox")
      expect(word).to have_attributes(status: "draft", ipa: "/ˈsændbɑːks/")
      expect(word.vocabulary_category.name).to eq("Testing & QA")
      expect(word.vocabulary_examples.first.sentence_en).to eq("We test the change in a sandbox.")
      expect(word.vocabulary_collocations.pluck(:phrase)).to match_array([ "sandbox environment", "use a sandbox" ])
    end

    it "updates an existing word instead of duplicating it and keeps its status" do
      existing = create(:vocabulary_word, term: "sandbox", part_of_speech: "noun", status: "published")
      import(csv)
      expect(json["data"]).to include("created" => 1, "updated" => 1)
      expect(VocabularyWord.where(term: "sandbox").count).to eq(1)
      expect(existing.reload).to have_attributes(status: "published", meaning_vi: "môi trường thử nghiệm")
    end

    it "checks a file without saving when dry_run is set" do
      import(csv, dry_run: true)
      expect(json["data"]).to include("created" => 2, "dry_run" => true)
      expect(VocabularyWord.where(term: %w[sandbox throttle])).to be_empty
    end

    it "reports row errors and saves nothing from a bad file" do
      bad = csv + "oops,gadget,,,\"\",,,,\n"
      import(bad)
      expect(json["data"]["errors"].first["row"]).to eq(4)
      expect(json["data"]).to include("created" => 0)
      expect(VocabularyWord.where(term: "sandbox")).to be_empty
    end

    it "rejects a file with missing columns" do
      import("term,meaning_vi\nx,y\n")
      expect(json["data"]["errors"].first["message"]).to include("Missing columns")
    end

    it "is admin only" do
      post "/api/v1/admin/words/import", params: { csv: csv }, headers: auth_headers(create(:user)), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "path units" do
    let!(:collection) { create(:learning_collection, slug: "daily-standup") }
    let!(:scenario) { create(:it_scenario, slug: "code-review") }

    it "creates a unit with steps written as lines and shows them back" do
      post "/api/v1/admin/units", params: { unit: { title: "My Unit", level: "a2", status: "draft", audiences: %w[qa], steps: [ "words:daily-standup", "scenario:code-review", "quiz" ] } }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(json["data"]).to include("steps" => [ "words:daily-standup", "scenario:code-review", "quiz" ], "audiences" => [ "qa" ])
      expect(PathUnit.find_by!(title: "My Unit").path_steps.map(&:kind)).to eq(%w[words scenario quiz])
    end

    it "rejects an unknown reference and saves nothing" do
      post "/api/v1/admin/units", params: { unit: { title: "Broken", level: "a2", status: "draft", steps: [ "words:nope" ] } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig("error", "details", "steps").first).to include("words:nope")
      expect(PathUnit.find_by(title: "Broken")).to be_nil
    end

    it "replaces the steps when the unit is edited" do
      unit = create(:path_unit)
      patch "/api/v1/admin/units/#{unit.id}", params: { unit: { steps: [ "quiz" ] } }, headers: headers, as: :json
      expect(unit.reload.path_steps.map(&:kind)).to eq(%w[quiz])
    end
  end
end
