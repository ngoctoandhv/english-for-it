class ListeningQuestion < ApplicationRecord
  belongs_to :listening_lesson, inverse_of: :listening_questions

  validates :prompt, presence: true
  validate :choices_and_answer_are_consistent

  private

  def choices_and_answer_are_consistent
    unless choices.is_a?(Array) && choices.size >= 2 && choices.all? { |c| c.is_a?(String) && c.present? }
      return errors.add(:choices, "must be a list of at least 2 non-blank options")
    end
    errors.add(:correct_index, "must point to one of the choices") unless correct_index.is_a?(Integer) && correct_index.between?(0, choices.size - 1)
  end
end
