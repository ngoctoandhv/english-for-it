module Quizzes
  # Stateless quick quiz in three modes. Answers are checked on the server. Quizzes never change the review schedule.
  #   choice: which Vietnamese meaning matches this word?
  #   listen: you hear a word (recording or browser voice), pick the word you heard
  #   type:   read a simple English definition and type the word
  #   cloze:  type the missing word in one of the word's own example sentences (falls back to type)
  class Quick
    OPTIONS = 4
    MODES = %w[choice listen type cloze].freeze

    def self.build(user, count: 5, mode: "choice")
      mode = "choice" unless MODES.include?(mode)
      pool = VocabularyWord.published
      return [] if pool.count < OPTIONS

      words = pick_words(user, pool, count)
      words.map do |word|
        case mode
        when "listen" then listen_question(pool, word)
        when "type" then type_question(word)
        when "cloze" then cloze_question(word)
        else choice_question(pool, word)
        end
      end
    end

    def self.pick_words(user, pool, count)
      started = pool.where(id: user.user_word_progresses.select(:vocabulary_word_id)).order(Arel.sql("RANDOM()")).limit(count).to_a
      filler = pool.where.not(id: started.map(&:id)).order(Arel.sql("RANDOM()")).limit(count - started.size).to_a
      (started + filler).shuffle
    end

    def self.distractors(pool, word)
      same = pool.where(part_of_speech: word.part_of_speech).where.not(id: word.id).order(Arel.sql("RANDOM()")).limit(OPTIONS - 1).to_a
      others = same.size < OPTIONS - 1 ? pool.where.not(id: [ word.id ] + same.map(&:id)).order(Arel.sql("RANDOM()")).limit(OPTIONS - 1 - same.size).to_a : []
      same + others
    end

    def self.choice_question(pool, word)
      options = ([ word ] + distractors(pool, word)).shuffle.map { |w| { word_id: w.id, meaning_vi: w.meaning_vi } }
      { mode: "choice", word_id: word.id, term: word.term, ipa: word.ipa, part_of_speech: word.part_of_speech, options: options }
    end

    def self.listen_question(pool, word)
      options = ([ word ] + distractors(pool, word)).shuffle.map { |w| { word_id: w.id, term: w.term } }
      { mode: "listen", word_id: word.id, audio_url: AudioUrl.call(word.audio), speak_text: (word.term unless word.audio.attached?), options: options }
    end

    def self.type_question(word)
      { mode: "type", word_id: word.id, definition_en: word.definition_en, meaning_vi: word.meaning_vi,
        part_of_speech: word.part_of_speech, length: word.term.length, first_letter: word.term[0] }
    end

    def self.cloze_question(word)
      cloze = Cloze.for(word)
      return type_question(word) unless cloze

      { mode: "cloze", word_id: word.id, sentence: cloze.sentence, translation_vi: cloze.translation_vi,
        part_of_speech: word.part_of_speech, length: cloze.form.length, first_letter: cloze.form[0] }
    end

    # The base term always counts; so does the inflected form used in the word's cloze sentence.
    def self.typed_verdict(text, word)
      forms = [ word.term, Cloze.for(word)&.form ].compact.uniq
      verdicts = forms.map { |f| TypedAnswer.check(text, f) }
      verdicts.find { |v| v == :correct } || verdicts.find { |v| v == :close } || :wrong
    end

    def self.grade(answers)
      words = VocabularyWord.published.includes(:vocabulary_examples).where(id: answers.map { |a| a[:word_id].to_i }).index_by(&:id)
      results = answers.filter_map do |a|
        word = words[a[:word_id].to_i]
        next unless word

        if a[:text].nil?
          { word_id: word.id, correct: a[:choice_word_id].to_i == word.id, close: false, correct_term: word.term, correct_meaning_vi: word.meaning_vi }
        else
          verdict = typed_verdict(a[:text], word)
          { word_id: word.id, correct: verdict == :correct, close: verdict == :close, correct_term: word.term, correct_meaning_vi: word.meaning_vi }
        end
      end
      { score: results.count { |r| r[:correct] }, total: results.size, results: results }
    end
  end
end
