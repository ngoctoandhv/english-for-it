class VocabularyWord < ApplicationRecord
  include Publishable

  PARTS_OF_SPEECH = %w[noun verb adjective adverb phrase].freeze
  MAX_AUDIO_BYTES = 5.megabytes

  belongs_to :vocabulary_category, optional: true
  has_many :vocabulary_examples, -> { order(:position, :id) }, dependent: :destroy, inverse_of: :vocabulary_word
  has_many :vocabulary_collocations, dependent: :destroy, inverse_of: :vocabulary_word
  has_many :collection_words, dependent: :destroy
  has_many :learning_collections, through: :collection_words
  has_one_attached :audio

  accepts_nested_attributes_for :vocabulary_examples, allow_destroy: true
  accepts_nested_attributes_for :vocabulary_collocations, allow_destroy: true

  validates :term, :meaning_vi, :definition_en, presence: true
  validates :part_of_speech, inclusion: { in: PARTS_OF_SPEECH }
  validates :term, uniqueness: { scope: :part_of_speech, case_sensitive: false }
  validate :audio_must_be_small_audio

  def self.search(q)
    return all if q.blank?

    like = "%#{sanitize_sql_like(q.strip)}%"
    where("vocabulary_words.term ILIKE :q OR vocabulary_words.meaning_vi ILIKE :q", q: like)
  end

  private

  def audio_must_be_small_audio
    return unless audio.attached?

    errors.add(:audio, "must be an audio file") unless audio.content_type.to_s.start_with?("audio/")
    errors.add(:audio, "must be smaller than 5 MB") if audio.byte_size > MAX_AUDIO_BYTES
  end
end
