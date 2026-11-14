class NewWordsPerDay < ActiveRecord::Migration[8.1]
  def change
    # NULL = automatic (based on the daily goal). Learners can also start extra new-word sessions at any time.
    add_column :users, :new_words_per_day, :integer
    add_check_constraint :users, "new_words_per_day IS NULL OR (new_words_per_day BETWEEN 1 AND 100)", name: "users_new_words_per_day_check"
  end
end
