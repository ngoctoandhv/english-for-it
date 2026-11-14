module Accounts
  # Deletes a user and everything they own. Review logs are immutable at the database level; the transaction
  # opts in to deleting them for this one user with a transaction-local setting.
  class Erase
    def self.call(user)
      ActiveRecord::Base.transaction do
        ActiveRecord::Base.connection.execute("SET LOCAL app.erase_account = 'on'")
        ReviewLog.where(user_id: user.id).delete_all
        user.destroy!
      end
    end
  end
end
