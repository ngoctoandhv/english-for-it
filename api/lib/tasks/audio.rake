# Natural voices: `bin/audio` runs these tasks around the Kokoro generator (tools/tts).
namespace :audio do
  # Voices assigned to speakers in order of first appearance, so each person keeps one voice in a dialogue.
  DIALOGUE_VOICES = %w[af_heart am_michael af_bella am_adam af_nicole am_eric].freeze
  NARRATOR_VOICE = "af_heart".freeze

  def speaker_voices(speakers)
    speakers.uniq.each_with_index.to_h { |name, i| [ name, DIALOGUE_VOICES[i % DIALOGUE_VOICES.size] ] }
  end

  def transcript_lines(text)
    text.to_s.lines.filter_map do |line|
      match = line.strip.match(/\A([^:]{1,30}):\s*(.+)\z/)
      match && [ match[1].strip, match[2].strip ]
    end
  end

  def tagged(entry, record) = entry.merge(target: [ record.class.name, record.id ])

  # File names come from the content, so re-seeding or editing other fields never invalidates a recording.
  def clip_name(voice, text, speed = 1.0) = "#{Digest::SHA1.hexdigest("#{voice}|#{speed}|#{text}")[0, 16]}.mp3"

  desc "List every clip that should exist (api/tmp/audio-manifest.json)"
  task manifest: :environment do
    entries = []

    VocabularyWord.published.includes(:vocabulary_examples).find_each do |word|
      entries << tagged({ file: clip_name(NARRATOR_VOICE, word.term, 0.95), voice: NARRATOR_VOICE, text: word.term, speed: 0.95 }, word)
      word.vocabulary_examples.each do |ex|
        entries << tagged({ file: clip_name(NARRATOR_VOICE, ex.sentence_en), voice: NARRATOR_VOICE, text: ex.sentence_en }, ex)
      end
    end

    ToolkitPhrase.published.find_each do |phrase|
      entries << tagged({ file: clip_name(NARRATOR_VOICE, phrase.text_en), voice: NARRATOR_VOICE, text: phrase.text_en }, phrase)
    end

    ListeningLesson.published.find_each do |lesson|
      lines = transcript_lines(lesson.transcript_en)
      voices = speaker_voices(lines.map(&:first))
      files = lines.each_with_index.map do |(speaker, text), i|
        file = clip_name(voices[speaker], text)
        entries << { file: file, voice: voices[speaker], text: text }
        file
      end
      entries << tagged({ file: "lesson-#{Digest::SHA1.hexdigest(files.join)[0, 16]}.mp3", concat: files, gap: 0.5 }, lesson) if files.any?
    end

    ItScenario.published.includes(:scenario_dialogues).find_each do |scenario|
      voices = speaker_voices(scenario.scenario_dialogues.map(&:speaker))
      scenario.scenario_dialogues.each do |d|
        entries << tagged({ file: clip_name(voices[d.speaker], d.text_en), voice: voices[d.speaker], text: d.text_en }, d)
      end
    end

    entries = entries.uniq { |e| [ e[:file], e[:target] ] }
    path = Rails.root.join("tmp/audio-manifest.json")
    File.write(path, JSON.pretty_generate(entries))
    puts "#{entries.size} entries written to #{path}"
  end

  desc "Attach generated files from tmp/audio to their records"
  task attach: :environment do
    manifest = JSON.parse(File.read(Rails.root.join("tmp/audio-manifest.json")))
    attached = skipped = 0
    manifest.each do |entry|
      next unless entry["target"]

      path = Rails.root.join("tmp/audio", entry["file"])
      unless path.exist?
        skipped += 1
        next
      end
      klass, id = entry["target"]
      record = klass.constantize.find_by(id: id)
      next if record.nil? || record.audio.attached?

      record.audio.attach(io: path.open, filename: entry["file"], content_type: "audio/mpeg")
      attached += 1
    end
    puts "attached #{attached}, missing files #{skipped}"
  end
end
