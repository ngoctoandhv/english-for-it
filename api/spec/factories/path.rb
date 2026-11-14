FactoryBot.define do
  # A complete unit: 5 words in a collection, one listening lesson, one scenario and a quiz.
  factory :path_unit do
    sequence(:title) { |n| "Unit #{n}" }
    level { "a2" }
    status { "published" }

    transient { words_count { 5 } }

    after(:create) do |unit, ev|
      collection = create(:learning_collection)
      collection.replace_words!(create_list(:vocabulary_word, ev.words_count).map(&:id))
      unit.path_steps.create!(position: 0, kind: "words", learning_collection: collection)
      unit.path_steps.create!(position: 1, kind: "listening", listening_lesson: create(:listening_lesson))
      unit.path_steps.create!(position: 2, kind: "scenario", it_scenario: create(:it_scenario))
      unit.path_steps.create!(position: 3, kind: "quiz")
    end
  end
end
