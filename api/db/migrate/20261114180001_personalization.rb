class Personalization < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :focus_role, :string
    add_column :users, :focus_goal, :string
    add_column :path_units, :audiences, :string, array: true, null: false, default: []
  end
end
