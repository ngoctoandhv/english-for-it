require "rails_helper"

RSpec.describe Scheduling::Simple do
  let(:now) { Time.utc(2026, 1, 1, 12) }
  let(:scheduler) { Scheduling.algorithm }
  let(:fresh) { Scheduling.new_state(now: now) }

  def review(state, rating) = scheduler.call(state, rating, now: now)

  it "schedules a new card on its first good review for one day" do
    s = review(fresh, "good")
    expect(s).to have_attributes(state: "review", interval_days: 1, reps: 1, ease: 2.5, lapses: 0)
    expect(s.due_at).to eq(now + 1.day)
  end

  it "gives easy a longer first interval and raises ease" do
    expect(review(fresh, "easy")).to have_attributes(interval_days: 4, ease: 2.65)
  end

  it "gives hard a short first interval and lowers ease" do
    expect(review(fresh, "hard")).to have_attributes(interval_days: 1, ease: 2.35)
  end

  it "grows intervals by the ease factor on repeated good reviews" do
    s = review(review(fresh, "good"), "good")
    expect(s.interval_days).to eq(3)
    expect(review(s, "good").interval_days).to eq(8)
  end

  it "always moves forward by at least one day on good/easy, even with a low ease" do
    low = Scheduling::State.new(state: "review", due_at: now, interval_days: 1, ease: 1.3, reps: 3, lapses: 0)
    expect(review(low, "good").interval_days).to eq(2)
  end

  it "applies the hard multiplier to existing intervals" do
    s = Scheduling::State.new(state: "review", due_at: now, interval_days: 10, ease: 2.5, reps: 4, lapses: 0)
    expect(review(s, "hard").interval_days).to eq(12)
  end

  it "resets to learning on again, counts a lapse, keeps ease above the floor and returns in minutes" do
    s = Scheduling::State.new(state: "review", due_at: now, interval_days: 10, ease: 1.3, reps: 4, lapses: 1)
    r = review(s, "again")
    expect(r).to have_attributes(state: "learning", interval_days: 0, reps: 0, lapses: 2, ease: 1.3)
    expect(r.due_at).to eq(now + 10.minutes)
  end

  it "caps the interval" do
    s = Scheduling::State.new(state: "review", due_at: now, interval_days: 300, ease: 2.5, reps: 9, lapses: 0)
    expect(review(s, "easy").interval_days).to eq(365)
  end

  it "does not mutate its input and rejects unknown ratings" do
    review(fresh, "good")
    expect(fresh.reps).to eq(0)
    expect { review(fresh, "meh") }.to raise_error(ArgumentError)
  end

  it "uses configurable parameters" do
    custom = described_class.new(Scheduling.config.merge(first_interval_days: { hard: 2, good: 3, easy: 7 }))
    expect(custom.call(fresh, "good", now: now).interval_days).to eq(3)
  end
end
