class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.string :role, null: false, default: "user"
      t.string :level
      t.integer :daily_goal_minutes, null: false, default: 10
      t.string :time_zone, null: false, default: "UTC"
      t.datetime :onboarded_at
      t.timestamps
    end
    add_index :users, "lower(email)", unique: true, name: "index_users_on_lower_email"
    add_check_constraint :users, "role IN ('user','admin')", name: "users_role_check"
    add_check_constraint :users, "daily_goal_minutes IN (5,10,15)", name: "users_goal_check"

    create_table :refresh_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at
      t.string :user_agent
      t.timestamps
    end
    add_index :refresh_tokens, :token_digest, unique: true
  end
end
