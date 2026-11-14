class UnitQuizResult < ApplicationRecord
  belongs_to :user
  belongs_to :path_unit
  validates :score, :total, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
