FactoryBot.define do
  factory :it_scenario do
    sequence(:title) { |n| "Scenario #{n}" }
    status { "published" }
    after(:create) do |s|
      s.scenario_dialogues.create!(position: 0, speaker: "Manager", role: "other", text_en: "Hello", text_vi: "Xin chào")
      s.scenario_dialogues.create!(position: 1, speaker: "You", role: "you", text_en: "Hi", tip: "Be friendly")
      s.scenario_dialogues.create!(position: 2, speaker: "Manager", role: "other", text_en: "Bye")
    end
  end
end
