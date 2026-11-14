class CreateScenarios < ActiveRecord::Migration[8.1]
  def change
    create_table :it_scenarios do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :description
      t.text :situation
      t.string :level, null: false, default: "elementary"
      t.string :status, null: false, default: "draft"
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :it_scenarios, :slug, unique: true
    add_check_constraint :it_scenarios, "status IN ('draft','reviewed','published')", name: "it_scenarios_status_check"
    add_check_constraint :it_scenarios, "level IN ('beginner','elementary','intermediate')", name: "it_scenarios_level_check"

    create_table :scenario_dialogues do |t|
      t.references :it_scenario, null: false, foreign_key: { on_delete: :cascade }
      t.integer :position, null: false
      t.string :speaker, null: false
      t.string :role, null: false, default: "other"
      t.text :text_en, null: false
      t.text :text_vi
      t.text :tip
      t.timestamps
    end
    # Deferred so lines can be re-numbered inside one transaction (e.g. after removing a line).
    add_unique_constraint :scenario_dialogues, %i[it_scenario_id position], deferrable: :deferred, name: "scenario_dialogues_position_unique"
    add_check_constraint :scenario_dialogues, "role IN ('other','you')", name: "scenario_dialogues_role_check"

    create_table :scenario_progresses do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :it_scenario, null: false, foreign_key: { on_delete: :cascade }
      t.integer :last_position, null: false, default: 0
      t.datetime :completed_at
      t.timestamps
    end
    add_index :scenario_progresses, %i[user_id it_scenario_id], unique: true, name: "index_scenario_progress_unique"
  end
end
