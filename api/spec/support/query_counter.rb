module QueryCounter
  # Counts SQL statements issued by the block (schema and transaction bookkeeping excluded).
  def count_queries
    count = 0
    sub = ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
      count += 1 unless payload[:name] == "SCHEMA" || payload[:sql].match?(/\A\s*(BEGIN|COMMIT|SAVEPOINT|RELEASE)/i)
    end
    yield
    count
  ensure
    ActiveSupport::Notifications.unsubscribe(sub)
  end
end

RSpec.configure { |c| c.include QueryCounter, type: :request }
