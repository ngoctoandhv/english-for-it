class CreatePathAndGrowth < ActiveRecord::Migration[8.1]
  def change
    create_table :path_units do |t|
      t.string :slug, null: false
      t.string :title, null: false
      t.text :description
      t.string :level, null: false
      t.integer :position, null: false, default: 0
      t.string :status, null: false, default: "draft"
      t.timestamps
    end
    add_index :path_units, :slug, unique: true
    add_check_constraint :path_units, "status IN ('draft','reviewed','published')", name: "path_units_status_check"
    add_check_constraint :path_units, "level IN ('elementary','intermediate')", name: "path_units_level_check"

    create_table :path_steps do |t|
      t.references :path_unit, null: false, foreign_key: { on_delete: :cascade }
      t.integer :position, null: false
      t.string :kind, null: false
      t.references :learning_collection, foreign_key: { on_delete: :cascade }
      t.references :listening_lesson, foreign_key: { on_delete: :cascade }
      t.references :it_scenario, foreign_key: { on_delete: :cascade }
      t.timestamps
    end
    add_unique_constraint :path_steps, %i[path_unit_id position], deferrable: :deferred, name: "path_steps_position_unique"
    add_check_constraint :path_steps, "kind IN ('words','listening','scenario','quiz')", name: "path_steps_kind_check"
    add_check_constraint :path_steps,
                         "(kind = 'quiz' AND num_nonnulls(learning_collection_id, listening_lesson_id, it_scenario_id) = 0) OR " \
                         "(kind <> 'quiz' AND num_nonnulls(learning_collection_id, listening_lesson_id, it_scenario_id) = 1)",
                         name: "path_steps_one_reference_check"

    # Persisted so that XP and "unit completed" never go away, even if content is edited later.
    create_table :unit_completions do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :path_unit, null: false, foreign_key: { on_delete: :cascade }
      t.datetime :completed_at, null: false
      t.timestamps
    end
    add_index :unit_completions, %i[user_id path_unit_id], unique: true, name: "index_unit_completions_unique"

    create_table :unit_quiz_results do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :path_unit, null: false, foreign_key: { on_delete: :cascade }
      t.integer :score, null: false
      t.integer :total, null: false
      t.datetime :created_at, null: false
    end
    add_index :unit_quiz_results, %i[user_id path_unit_id]
  end
end
