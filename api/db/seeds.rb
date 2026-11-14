# Content seeds. Re-runnable (idempotent).
# Content in db/seeds/*.yml is DRAFT: outside development it is imported as "draft" and must be reviewed and
# published by an admin. In development everything is published so the app is usable out of the box.
status = Rails.env.development? ? "published" : "draft"

# Vocabulary comes in batches (one file per batch); categories, words and collections are merged before importing.
data = %w[it_vocabulary it_vocabulary_2].map { |f| YAML.load_file(Rails.root.join("db/seeds/#{f}.yml")) }
          .each_with_object({ "categories" => [], "words" => [], "collections" => [] }) { |d, all| all.each_key { |k| all[k].concat(d.fetch(k, [])) } }

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

path = YAML.load_file(Rails.root.join("db/seeds/path.yml"))
path["units"].each_with_index do |u, i|
  unit = PathUnit.find_or_initialize_by(slug: u["slug"])
  unit.assign_attributes(title: u["title"], description: u["description"], level: u["level"], position: i, audiences: u["audiences"] || [])
  unit.status = status if unit.new_record?
  unit.save!
  unit.path_steps.destroy_all
  u["steps"].each_with_index do |step, pos|
    attrs = { position: pos }
    if step == "quiz"
      attrs[:kind] = "quiz"
    elsif step["words"]
      attrs.merge!(kind: "words", learning_collection: LearningCollection.find_by!(slug: step["words"]))
    elsif step["listening"]
      attrs.merge!(kind: "listening", listening_lesson: ListeningLesson.find_by!(title: step["listening"]))
    else
      attrs.merge!(kind: "scenario", it_scenario: ItScenario.find_by!(slug: step["scenario"]))
    end
    unit.path_steps.create!(attrs)
  end
end
puts "Seeded #{PathUnit.count} path units"

toolkit = YAML.load_file(Rails.root.join("db/seeds/toolkit.yml"))
toolkit["phrases"].group_by { |p| p["c"] }.each do |category, phrases|
  phrases.each_with_index do |p, i|
    rec = ToolkitPhrase.find_or_initialize_by(category: category, text_en: p["en"])
    rec.assign_attributes(text_vi: p["vi"], position: i)
    rec.status = status if rec.new_record?
    rec.save!
  end
end
puts "Seeded #{ToolkitPhrase.count} toolkit phrases"
