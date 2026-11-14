# Adds a validated `audio` attachment (audio/* only, at most 5 MB).
module AudioAttachable
  extend ActiveSupport::Concern
  MAX_AUDIO_BYTES = 5.megabytes

  included do
    has_one_attached :audio
    validate :audio_must_be_small_audio
  end

  private

  def audio_must_be_small_audio
    return unless audio.attached?

    errors.add(:audio, "must be an audio file") unless audio.content_type.to_s.start_with?("audio/")
    errors.add(:audio, "must be smaller than 5 MB") if audio.byte_size > MAX_AUDIO_BYTES
  end
end
