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
  rec.vocabulary_examples.destroy_all
  rec.vocabulary_examples.create!(sentence_en: w["ex"][0], translation_vi: w["ex"][1], position: 0)
  rec.vocabulary_collocations.destroy_all
  Array(w["col"]).each { |c| rec.vocabulary_collocations.create!(phrase: c) }
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
