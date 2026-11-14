module Quizzes
  # A fill-in-the-blank question built from a word's own example sentence: "We ___ the app on Friday."
  # The blank covers the word as it appears (deployed, deploys, deploying); the base term is accepted as well.
  module Cloze
    SUFFIX = "(?:s|es|d|ed|ing|ied|ies)?"

    Question = Struct.new(:sentence, :translation_vi, :form, keyword_init: true)

    def self.for(word)
      pattern = /\b#{Regexp.escape(word.term)}#{SUFFIX}\b/i
      word.vocabulary_examples.order(:position, :id).each do |example|
        match = example.sentence_en.match(pattern)
        next unless match

        blanked = example.sentence_en.sub(pattern, "_____")
        return Question.new(sentence: blanked, translation_vi: example.translation_vi, form: match[0])
      end
      nil
    end
  end
end
