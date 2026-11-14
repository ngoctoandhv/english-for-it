class CreateToolkitPhrases < ActiveRecord::Migration[8.1]
  def change
    create_table :toolkit_phrases do |t|
      t.string :category, null: false
      t.text :text_en, null: false
      t.text :text_vi, null: false
      t.integer :position, null: false, default: 0
      t.string :status, null: false, default: "draft"
      t.timestamps
    end
    add_index :toolkit_phrases, %i[category position]
    add_check_constraint :toolkit_phrases, "status IN ('draft','reviewed','published')", name: "toolkit_phrases_status_check"
    add_check_constraint :toolkit_phrases, "category IN ('pr_feedback','standup','meeting','incident','email')", name: "toolkit_phrases_category_check"
  end
end
