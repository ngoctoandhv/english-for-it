class CefrLevels < ActiveRecord::Migration[8.1]
  MAP_SQL = "CASE level WHEN 'beginner' THEN 'a1' WHEN 'elementary' THEN 'a2' WHEN 'intermediate' THEN 'b1' ELSE level END"
  TABLES = %w[it_scenarios listening_lessons path_units].freeze

  def up
    TABLES.each do |t|
      remove_check_constraint t, name: "#{t}_level_check"
      execute "UPDATE #{t} SET level = #{MAP_SQL}"
      add_check_constraint t, "level IN ('a1','a2','b1','b2')", name: "#{t}_level_check"
    end
    execute "UPDATE users SET level = #{MAP_SQL} WHERE level IS NOT NULL"
    add_check_constraint :users, "level IS NULL OR level IN ('a1','a2','b1','b2')", name: "users_level_check"

    add_column :vocabulary_words, :cefr_level, :string
    add_check_constraint :vocabulary_words, "cefr_level IS NULL OR cefr_level IN ('a1','a2','b1','b2')", name: "vocabulary_words_cefr_level_check"
    add_index :vocabulary_words, :cefr_level
  end

  def down
    remove_index :vocabulary_words, :cefr_level
    remove_check_constraint :vocabulary_words, name: "vocabulary_words_cefr_level_check"
    remove_column :vocabulary_words, :cefr_level
    remove_check_constraint :users, name: "users_level_check"
    back = "CASE level WHEN 'a1' THEN 'beginner' WHEN 'a2' THEN 'elementary' ELSE 'intermediate' END"
    execute "UPDATE users SET level = #{back} WHERE level IS NOT NULL"
    TABLES.each do |t|
      remove_check_constraint t, name: "#{t}_level_check"
      execute "UPDATE #{t} SET level = #{back}"
      allowed = t == "path_units" ? "'elementary','intermediate'" : "'beginner','elementary','intermediate'"
      execute "UPDATE path_units SET level = 'elementary' WHERE level = 'beginner'" if t == "path_units"
      add_check_constraint t, "level IN (#{allowed})", name: "#{t}_level_check"
    end
  end
end
