# Content seeds. Re-runnable (idempotent).
# Content in db/seeds/*.yml is DRAFT: outside development it is imported as "draft" and must be reviewed and
# published by an admin. In development everything is published so the app is usable out of the box.
status = Rails.env.development? ? "published" : "draft"

data = YAML.load_file(Rails.root.join("db/seeds/it_vocabulary.yml"))

categories = data["categories"].each_with_index.to_h do |c, i|
  rec = VocabularyCategory.find_or_initialize_by(slug: c["slug"])
  rec.update!(name: c["name"], position: i)
  [ c["slug"], rec ]
end

words = {}
data["words"].each do |w|
  rec = VocabularyWord.find_or_initialize_by(term: w["t"], part_of_speech: w["pos"])
  rec.assign_attributes(ipa: w["ipa"], meaning_vi: w["vi"], definition_en: w["def"],
                        vocabulary_category: categories.fetch(w["cat"]))
  rec.status = status if rec.new_record?
  rec.save!
  # Update in place (keeps ids, so attached audio survives re-seeding).
  example = rec.vocabulary_examples.order(:position, :id).first || rec.vocabulary_examples.build
  example.update!(sentence_en: w["ex"][0], translation_vi: w["ex"][1], position: 0)
  rec.vocabulary_examples.where.not(id: example.id).destroy_all
  rec.vocabulary_collocations.where.not(phrase: Array(w["col"])).destroy_all
  Array(w["col"]).each { |c| rec.vocabulary_collocations.find_or_create_by!(phrase: c) }
  words[w["t"]] = rec
end

data["collections"].each_with_index do |c, i|
  rec = LearningCollection.find_or_initialize_by(slug: c["slug"])
  rec.assign_attributes(title: c["title"], description: c["description"], position: i)
  rec.status = status if rec.new_record?
  rec.save!
  rec.replace_words!(c["words"].map { |t| words.fetch(t).id })
end

load Rails.root.join("db/seeds/dev_accounts.rb") if Rails.env.development?
puts "Seeded #{VocabularyWord.count} words (status for new records: #{status})"

listening = YAML.load_file(Rails.root.join("db/seeds/listening.yml"))
listening["lessons"].each_with_index do |l, i|
  lesson = ListeningLesson.find_or_initialize_by(title: l["title"])
  lesson.assign_attributes(level: l["level"], description: l["description"], transcript_en: l["transcript_en"].strip,
                           transcript_vi: l["transcript_vi"].strip, position: i)
  lesson.status = status if lesson.new_record?
  lesson.save!
  l["questions"].each_with_index do |q, j|
    question = lesson.listening_questions.find_by(position: j) || lesson.listening_questions.build(position: j)
    question.update!(prompt: q["prompt"], choices: q["choices"], correct_index: q["correct"])
  end
  lesson.listening_questions.where("position >= ?", l["questions"].size).destroy_all
end
puts "Seeded #{ListeningLesson.count} listening lessons"

scenarios = YAML.load_file(Rails.root.join("db/seeds/scenarios.yml"))
scenarios["scenarios"].each_with_index do |s, i|
  rec = ItScenario.find_or_initialize_by(slug: s["slug"])
  rec.assign_attributes(title: s["title"], level: s["level"], description: s["description"], situation: s["situation"], position: i)
  rec.status = status if rec.new_record?
  rec.save!
  s["lines"].each_with_index do |l, j|
    line = rec.scenario_dialogues.find_by(position: j) || rec.scenario_dialogues.build(position: j)
    line.update!(speaker: l["speaker"], role: l["role"], text_en: l["en"], text_vi: l["vi"], tip: l["tip"])
  end
  rec.scenario_dialogues.where("position >= ?", s["lines"].size).destroy_all
end
puts "Seeded #{ItScenario.count} scenarios"
