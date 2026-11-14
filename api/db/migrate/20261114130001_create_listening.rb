class CreateListening < ActiveRecord::Migration[8.1]
  def change
    create_table :listening_lessons do |t|
      t.string :title, null: false
      t.text :description
      t.string :level, null: false, default: "elementary"
      t.text :transcript_en, null: false
      t.text :transcript_vi
      t.integer :duration_seconds
      t.integer :position, null: false, default: 0
      t.string :status, null: false, default: "draft"
      t.timestamps
    end
    add_check_constraint :listening_lessons, "status IN ('draft','reviewed','published')", name: "listening_lessons_status_check"
    add_check_constraint :listening_lessons, "level IN ('beginner','elementary','intermediate')", name: "listening_lessons_level_check"

    create_table :listening_questions do |t|
      t.references :listening_lesson, null: false, foreign_key: { on_delete: :cascade }
      t.text :prompt, null: false
      t.jsonb :choices, null: false, default: []
      t.integer :correct_index, null: false
      t.text :explanation
      t.integer :position, null: false, default: 0
      t.timestamps
    end

    create_table :listening_attempts do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :listening_lesson, null: false, foreign_key: { on_delete: :cascade }
      t.integer :score, null: false
      t.integer :total, null: false
      t.jsonb :answers, null: false, default: []
      t.datetime :completed_at, null: false
      t.timestamps
    end
    add_index :listening_attempts, %i[user_id listening_lesson_id]
  end
end
