require "rails_helper"

RSpec.describe User do
  it "computes the local date in the user's time zone" do
    user = build(:user, time_zone: "Asia/Ho_Chi_Minh")
    expect(user.local_today(Time.utc(2026, 1, 1, 20, 0))).to eq(Date.new(2026, 1, 2))
  end

  it "stores email normalized" do
    expect(create(:user, email: "  Foo@Bar.test ").email).to eq("foo@bar.test")
  end
end
