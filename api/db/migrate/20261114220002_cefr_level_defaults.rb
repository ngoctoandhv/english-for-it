class CefrLevelDefaults < ActiveRecord::Migration[8.1]
  def change
    %i[it_scenarios listening_lessons].each { |t| change_column_default t, :level, from: "elementary", to: "a2" }
  end
end
