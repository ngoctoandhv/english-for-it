class PushReminders < ActiveRecord::Migration[8.1]
  def change
    create_table :push_subscriptions do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.text :endpoint, null: false
      t.string :p256dh, null: false
      t.string :auth, null: false
      t.string :user_agent
      t.timestamps
    end
    add_index :push_subscriptions, :endpoint, unique: true

    add_column :users, :reminder_hour, :integer
    add_column :users, :reminder_last_sent_on, :date
    add_column :users, :recap_last_sent_on, :date
    add_check_constraint :users, "reminder_hour IS NULL OR (reminder_hour >= 0 AND reminder_hour <= 23)", name: "users_reminder_hour_check"
  end
end
