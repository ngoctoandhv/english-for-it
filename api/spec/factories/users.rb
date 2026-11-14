FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.test" }
    name { "Test User" }
    password { "correct-horse-battery" }
    trait(:admin) { role { "admin" } }
    trait(:onboarded) do
      level { "a2" }
      onboarded_at { Time.current }
    end
  end
end
