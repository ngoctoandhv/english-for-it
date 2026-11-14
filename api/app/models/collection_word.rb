class CollectionWord < ApplicationRecord
  belongs_to :learning_collection
  belongs_to :vocabulary_word
  validates :vocabulary_word_id, uniqueness: { scope: :learning_collection_id }
end
