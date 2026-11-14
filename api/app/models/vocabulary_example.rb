class VocabularyExample < ApplicationRecord
  include AudioAttachable

  belongs_to :vocabulary_word, inverse_of: :vocabulary_examples
  validates :sentence_en, :translation_vi, presence: true
end
