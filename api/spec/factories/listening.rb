FactoryBot.define do
  factory :listening_lesson do
    sequence(:title) { |n| "Lesson #{n}" }
    transcript_en { "A: Hello.\nB: Hi." }
    status { "published" }
    after(:create) do |lesson|
      lesson.listening_questions.create!(prompt: "Q1?", choices: %w[a b c], correct_index: 1, position: 0, explanation: "because")
      lesson.listening_questions.create!(prompt: "Q2?", choices: %w[x y], correct_index: 0, position: 1)
    end
  end
end
