class CreateLearning < ActiveRecord::Migration[8.1]
  def up
    create_table :user_word_progresses do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :cascade }
      t.string :state, null: false, default: "learning"
      t.datetime :due_at, null: false
      t.integer :interval_days, null: false, default: 0
      t.decimal :ease, precision: 4, scale: 2, null: false, default: 2.5
      t.integer :reps, null: false, default: 0
      t.integer :lapses, null: false, default: 0
      t.datetime :last_reviewed_at
      t.timestamps
    end
    add_index :user_word_progresses, %i[user_id vocabulary_word_id], unique: true, name: "index_progress_unique"
    add_index :user_word_progresses, %i[user_id due_at]
    add_check_constraint :user_word_progresses, "state IN ('learning','review')", name: "progress_state_check"

    create_table :learning_sessions do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.date :session_date, null: false
      t.string :status, null: false, default: "in_progress"
      t.datetime :completed_at
      t.timestamps
    end
    add_index :learning_sessions, %i[user_id session_date]
    add_index :learning_sessions, :user_id, unique: true, where: "status = 'in_progress'", name: "index_sessions_one_open_per_user"
    add_check_constraint :learning_sessions, "status IN ('in_progress','completed')", name: "sessions_status_check"

    create_table :learning_session_items do |t|
      t.references :learning_session, null: false, foreign_key: { on_delete: :cascade }
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :cascade }
      t.string :kind, null: false
      t.integer :position, null: false
      t.datetime :completed_at
      t.timestamps
    end
    add_index :learning_session_items, %i[learning_session_id position], unique: true, name: "index_items_session_position"
    add_index :learning_session_items, %i[learning_session_id vocabulary_word_id], unique: true, name: "index_items_session_word"
    add_check_constraint :learning_session_items, "kind IN ('new','review')", name: "items_kind_check"

    create_table :review_logs do |t|
      t.references :user, null: false, foreign_key: { on_delete: :restrict }
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :restrict }
      t.references :learning_session_item, foreign_key: { on_delete: :nullify }
      t.string :rating, null: false
      t.string :client_request_id, null: false
      t.datetime :reviewed_at, null: false
      t.jsonb :state_before, null: false, default: {}
      t.jsonb :state_after, null: false, default: {}
      t.datetime :created_at, null: false
    end
    add_index :review_logs, %i[user_id client_request_id], unique: true, name: "index_review_logs_idempotency"
    add_index :review_logs, %i[user_id reviewed_at]
    add_check_constraint :review_logs, "rating IN ('again','hard','good','easy')", name: "review_logs_rating_check"

    # Review history is immutable: block UPDATE and DELETE at the database level.
    execute <<~SQL
      CREATE FUNCTION review_logs_immutable() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'review_logs rows are immutable';
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER review_logs_no_change
      BEFORE UPDATE OR DELETE ON review_logs
      FOR EACH ROW EXECUTE FUNCTION review_logs_immutable();
    SQL
  end

  def down
    execute "DROP TRIGGER IF EXISTS review_logs_no_change ON review_logs; DROP FUNCTION IF EXISTS review_logs_immutable();"
    drop_table :review_logs
    drop_table :learning_session_items
    drop_table :learning_sessions
    drop_table :user_word_progresses
  end
end
