require "rails_helper"

RSpec.describe "Growth", type: :request do
  let(:user) { create(:user, :onboarded, time_zone: "Asia/Ho_Chi_Minh") }
  let(:headers) { auth_headers(user) }
  let!(:words) { create_list(:vocabulary_word, 3) }

  def log(word, at: Time.current)
    ReviewLog.create!(user: user, vocabulary_word: word, rating: "good", client_request_id: SecureRandom.uuid, reviewed_at: at)
  end

  it "requires authentication" do
    get "/api/v1/growth"
    expect(response).to have_http_status(:unauthorized)
  end

  it "starts as an intern with no XP and no pressure" do
    get "/api/v1/growth", headers: headers
    d = json["data"]
    expect(d).to include("xp" => 0, "progress_to_next" => 0)
    expect(d["rank"]).to include("key" => "intern")
    expect(d["next_rank"]).to include("key" => "junior", "xp" => 100)
    expect(d["calendar"].size).to eq(119)
    expect(d.to_s).not_to match(/streak|missed|lost/i)
  end

  it "adds XP for reviews and newly met words and never removes it" do
    log(words[0])
    log(words[0])
    log(words[1])
    get "/api/v1/growth", headers: headers
    first_xp = json["data"]["xp"]
    expect(first_xp).to eq(3 * Growth::Xp::PER_REVIEW + 2 * Growth::Xp::PER_NEW_WORD)

    # forgetting a card (progress reset) must not reduce XP
    UserWordProgress.create!(user: user, vocabulary_word: words[0], due_at: Time.current, state: "learning", reps: 0, lapses: 3)
    get "/api/v1/growth", headers: headers
    expect(json["data"]["xp"]).to eq(first_xp)
  end

  it "maps XP to career ranks" do
    xp = Growth::Xp.new(user)
    expect(xp.rank_for(0)[:rank][:key]).to eq("intern")
    expect(xp.rank_for(99)[:rank][:key]).to eq("intern")
    expect(xp.rank_for(100)[:rank][:key]).to eq("junior")
    expect(xp.rank_for(1000)[:rank][:key]).to eq("senior")
    top = xp.rank_for(9999)
    expect(top[:rank][:key]).to eq("lead")
    expect(top[:next_rank]).to be_nil
    expect(top[:progress_to_next]).to eq(100)
  end

  it "counts activity per local day and reports the week without penalties" do
    travel_to Time.utc(2026, 11, 11, 5, 0) do # Wednesday 12:00 in Ho Chi Minh City
      log(words[0], at: Time.utc(2026, 11, 10, 20, 0)) # 03:00 Wednesday local
      log(words[1], at: Time.utc(2026, 11, 11, 2, 0))
      get "/api/v1/growth", headers: headers
      cal = json["data"]["calendar"]
      expect(cal.last).to eq("date" => "2026-11-11", "count" => 2)
      expect(cal[-2]["count"]).to eq(0)
      expect(json["data"]["week"]).to include("active_days" => 1, "target" => 4, "start" => "2026-11-09")
    end
  end

  it "keeps activity private per user" do
    other = create(:user, :onboarded)
    ReviewLog.create!(user: other, vocabulary_word: words[0], rating: "easy", client_request_id: "o1", reviewed_at: Time.current)
    get "/api/v1/growth", headers: headers
    expect(json["data"]["xp"]).to eq(0)
  end
end
