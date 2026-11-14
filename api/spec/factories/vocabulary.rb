FactoryBot.define do
  factory :vocabulary_category do
    sequence(:name) { |n| "Category #{n}" }
  end

  factory :vocabulary_word do
    sequence(:term) { |n| "term#{n}" }
    part_of_speech { "noun" }
    meaning_vi { "nghĩa" }
    definition_en { "A simple definition." }
    status { "published" }
    trait(:draft) { status { "draft" } }
  end

  factory :learning_collection do
    sequence(:title) { |n| "Collection #{n}" }
    status { "published" }
  end
end
