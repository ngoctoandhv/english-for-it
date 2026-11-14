require "rails_helper"

RSpec.describe "Web push reminders", type: :request do
  let(:user) { create(:user, :onboarded, time_zone: "Asia/Ho_Chi_Minh") }
  let(:headers) { auth_headers(user) }
  let(:sub_params) { { subscription: { endpoint: "https://push.example/abc", p256dh: "key", auth: "secret" } } }

  around do |example|
    old = ENV.to_h.slice("VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "CRON_SECRET")
    ENV["VAPID_PUBLIC_KEY"] = "pub"
    ENV["VAPID_PRIVATE_KEY"] = "priv"
    ENV["CRON_SECRET"] = "s3cret"
    example.run
  ensure
    %w[VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY CRON_SECRET].each { |k| old.key?(k) ? ENV[k] = old[k] : ENV.delete(k) }
  end

  describe "subscribe and unsubscribe" do
    it "serves the public key and stores a subscription with a default reminder hour" do
      get "/api/v1/push/key", headers: headers
      expect(json["data"]["public_key"]).to eq("pub")

      post "/api/v1/push/subscriptions", params: sub_params, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(json["user"]).to include("reminder_hour" => 18, "push_devices" => 1)
    end

    it "rejects non-https endpoints and removes the reminder when the last device leaves" do
      post "/api/v1/push/subscriptions", params: { subscription: { endpoint: "http://insecure", p256dh: "k", auth: "a" } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)

      post "/api/v1/push/subscriptions", params: sub_params, headers: headers, as: :json
      delete "/api/v1/push/subscriptions", params: { endpoint: "https://push.example/abc" }, headers: headers, as: :json
      expect(json["user"]).to include("reminder_hour" => nil, "push_devices" => 0)
    end

    it "is hidden when VAPID keys are not configured" do
      ENV.delete("VAPID_PUBLIC_KEY")
      get "/api/v1/push/key", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "validates the reminder hour" do
      patch "/api/v1/me", params: { user: { reminder_hour: 25 } }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /internal/reminders" do
    let!(:words) { create_list(:vocabulary_word, 6) }

    before do
      user.update!(reminder_hour: 9)
      user.push_subscriptions.create!(endpoint: "https://push.example/abc", p256dh: "k", auth: "a")
      allow(WebPush).to receive(:payload_send).and_return(true)
    end

    def run_at(time, secret: "s3cret")
      travel_to(time) { post "/api/v1/internal/reminders", headers: { "X-Cron-Secret" => secret }, as: :json }
    end

    it "needs the shared secret" do
      run_at(Time.utc(2026, 3, 18, 2), secret: "wrong")
      expect(response).to have_http_status(:unauthorized)
      ENV.delete("CRON_SECRET")
      run_at(Time.utc(2026, 3, 18, 2), secret: "")
      expect(response).to have_http_status(:unauthorized)
    end

    it "sends one calm reminder at the user's local hour, with no streak wording" do
      run_at(Time.utc(2026, 3, 18, 2)) # 09:00 in Ho Chi Minh City, a Wednesday
      expect(json["data"]).to eq("reminders" => 1, "recaps" => 0)
      expect(WebPush).to have_received(:payload_send).once do |args|
        message = JSON.parse(args[:message])
        expect(message["body"]).to match(/cards are ready/)
        expect(message.to_s).not_to match(/streak|lost|miss|don't break/i)
      end

      run_at(Time.utc(2026, 3, 18, 2, 30)) # same hour, same day: no second message
      expect(json["data"]["reminders"]).to eq(0)
    end

    it "does nothing at other hours or when nothing is due" do
      run_at(Time.utc(2026, 3, 18, 5))
      expect(json["data"]).to eq("reminders" => 0, "recaps" => 0)
      VocabularyWord.delete_all
      run_at(Time.utc(2026, 3, 19, 2))
      expect(json["data"]["reminders"]).to eq(0)
    end

    it "sends a recap on Monday only if the learner studied last week" do
      messages = []
      allow(WebPush).to receive(:payload_send) { |args| messages << JSON.parse(args[:message]) }
      ReviewLog.create!(user: user, vocabulary_word: words.first, rating: "good", client_request_id: "w1", reviewed_at: Time.utc(2026, 3, 15, 5))
      run_at(Time.utc(2026, 3, 16, 2)) # Monday 09:00 local
      expect(json["data"]["recaps"]).to eq(1)
      recap = messages.find { |m| m["title"] == "Your week" }
      expect(recap["body"]).to start_with("Last week: 1 day, 1 review.")
      expect(recap["url"]).to eq("/progress")
    end

    it "skips the recap when last week was empty" do
      run_at(Time.utc(2026, 3, 16, 2))
      expect(json["data"]["recaps"]).to eq(0)
    end

    it "removes subscriptions the push service says are gone" do
      allow(WebPush).to receive(:payload_send).and_raise(WebPush::ExpiredSubscription.new(double(body: "gone", inspect: "x"), "push.example"))
      run_at(Time.utc(2026, 3, 18, 2))
      expect(user.push_subscriptions.count).to eq(0)
    end
  end

  it "reports days away on the dashboard" do
    word = create(:vocabulary_word)
    ReviewLog.create!(user: user, vocabulary_word: word, rating: "good", client_request_id: "a1", reviewed_at: 9.days.ago)
    get "/api/v1/dashboard", headers: headers
    expect(json["data"]["days_away"]).to eq(9)
  end
end
