class VocabularyWord < ApplicationRecord
  include Publishable
  include AudioAttachable

  PARTS_OF_SPEECH = %w[noun verb adjective adverb phrase].freeze

  belongs_to :vocabulary_category, optional: true
  has_many :vocabulary_examples, -> { order(:position, :id) }, dependent: :destroy, inverse_of: :vocabulary_word
  has_many :vocabulary_collocations, dependent: :destroy, inverse_of: :vocabulary_word
  has_many :collection_words, dependent: :destroy
  has_many :learning_collections, through: :collection_words

  accepts_nested_attributes_for :vocabulary_examples, allow_destroy: true
  accepts_nested_attributes_for :vocabulary_collocations, allow_destroy: true

  validates :term, :meaning_vi, :definition_en, presence: true
  validates :part_of_speech, inclusion: { in: PARTS_OF_SPEECH }
  validates :cefr_level, inclusion: { in: Cefr::LEVELS }, allow_nil: true
  normalizes :cefr_level, with: ->(l) { Cefr.normalize(l) }
  validates :term, uniqueness: { scope: :part_of_speech, case_sensitive: false }

  def self.search(q)
    return all if q.blank?

    like = "%#{sanitize_sql_like(q.strip)}%"
    where("vocabulary_words.term ILIKE :q OR vocabulary_words.meaning_vi ILIKE :q", q: like)
  end
end
