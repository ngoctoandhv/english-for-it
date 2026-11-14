class AccountFeatures < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :email_verified_at, :datetime

    # Review history stays immutable, with one exception: erasing the owner's account deletes it.
    # The account-erasure transaction sets `app.erase_account` locally; nothing else does.
    execute <<~SQL
      CREATE OR REPLACE FUNCTION review_logs_immutable() RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'DELETE' AND current_setting('app.erase_account', true) = 'on' THEN
          RETURN OLD;
        END IF;
        RAISE EXCEPTION 'review_logs rows are immutable';
      END;
      $$ LANGUAGE plpgsql;
    SQL
  end

  def down
    execute <<~SQL
      CREATE OR REPLACE FUNCTION review_logs_immutable() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'review_logs rows are immutable';
      END;
      $$ LANGUAGE plpgsql;
    SQL
    remove_column :users, :email_verified_at
  end
end
