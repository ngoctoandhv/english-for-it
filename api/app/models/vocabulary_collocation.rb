class VocabularyCollocation < ApplicationRecord
  belongs_to :vocabulary_word, inverse_of: :vocabulary_collocations
  validates :phrase, presence: true
end
