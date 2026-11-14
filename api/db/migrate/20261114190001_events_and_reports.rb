class EventsAndReports < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.references :user, foreign_key: { on_delete: :cascade }
      t.string :name, null: false
      t.jsonb :props, null: false, default: {}
      t.datetime :created_at, null: false
    end
    add_index :events, %i[name created_at]
    add_index :events, %i[user_id created_at]

    create_table :content_reports do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :reportable_type, null: false
      t.bigint :reportable_id, null: false
      t.text :message, null: false
      t.string :status, null: false, default: "open"
      t.timestamps
    end
    add_index :content_reports, %i[reportable_type reportable_id]
    add_index :content_reports, :status
    add_check_constraint :content_reports, "status IN ('open','resolved','dismissed')", name: "content_reports_status_check"
  end
end
