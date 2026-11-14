require "rails_helper"

# Mechanical checks on the draft seed content, so mistakes are caught before a human reviewer sees it.
# These do not prove the English is right; they catch broken references, missing fields and inconsistent data.
RSpec.describe "Seed content" do
  root = Rails.root.join("db/seeds")
  files = %w[it_vocabulary it_vocabulary_2 it_vocabulary_3 it_vocabulary_4].map { |f| YAML.load_file(root.join("#{f}.yml")) }
  words = files.flat_map { |d| d["words"] }
  categories = files.flat_map { |d| d["categories"].map { |c| c["slug"] } }
  collections = files.flat_map { |d| d["collections"] }
  terms = words.map { |w| w["t"] }
  # Examples that use an irregular form the cloze matcher cannot find (the quiz falls back to a definition question).
  cloze_exceptions = %w[commit investigate]

  it "gives every category and every word override a CEFR level" do
    cats = files.flat_map { |d| d["categories"] }
    expect(cats.reject { |c| Cefr::LEVELS.include?(c["level"]) }.map { |c| c["slug"] }).to be_empty
    expect(words.select { |w| w["lv"] && !Cefr::LEVELS.include?(w["lv"]) }.map { |w| w["t"] }).to be_empty
  end

  it "puts path units, lessons and scenarios on CEFR levels" do
    units = YAML.load_file(root.join("path.yml"))["units"]
    scen = YAML.load_file(root.join("scenarios.yml"))["scenarios"]
    expect((units + scen).reject { |u| Cefr::LEVELS.include?(u["level"]) }.map { |u| u["slug"] }).to be_empty
    expect(Cefr::LEVELS.map { |l| units.count { |u| u["level"] == l } }).to all(be >= 3)
  end

  it "has no duplicate term and part of speech" do
    dups = words.map { |w| [ w["t"].downcase, w["pos"] ] }.tally.select { |_, n| n > 1 }.keys
    expect(dups).to be_empty
  end

  it "gives every word the required fields, a known part of speech and a known category" do
    problems = words.filter_map do |w|
      missing = %w[t pos vi def cat ex].select { |k| w[k].blank? }
      bad = []
      bad << "pos #{w['pos']}" unless VocabularyWord::PARTS_OF_SPEECH.include?(w["pos"])
      bad << "category #{w['cat']}" unless categories.include?(w["cat"])
      bad << "example needs English and Vietnamese" unless w["ex"].is_a?(Array) && w["ex"].size == 2 && w["ex"].all?(&:present?)
      "#{w['t']}: #{(missing.map { |m| "missing #{m}" } + bad).join(', ')}" if missing.any? || bad.any?
    end
    expect(problems).to be_empty
  end

  it "writes IPA between slashes, without spaces at the edges" do
    bad = words.select { |w| w["ipa"].present? && w["ipa"] !~ %r{\A/[^/\s][^/]*[^/\s]/\z} }.map { |w| "#{w['t']} #{w['ipa']}" }
    expect(bad).to be_empty
  end

  it "uses each word in its own example sentence, so fill-the-gap questions work" do
    missing = words.reject do |w|
      cloze_exceptions.include?(w["t"]) || w["ex"][0] =~ /\b#{Regexp.escape(w['t'])}(?:s|es|d|ed|ing|ied|ies)?\b/i
    end
    expect(missing.map { |w| w["t"] }).to be_empty
  end

  it "ends definitions and example sentences with punctuation" do
    bad = words.reject { |w| w["def"].match?(/[.!?]\z/) && w["ex"].all? { |s| s.match?(/[.!?]\z/) } }.map { |w| w["t"] }
    expect(bad).to be_empty
  end

  it "only puts existing words in collections, each word at most once per collection" do
    problems = collections.flat_map do |c|
      (c["words"] - terms).map { |t| "#{c['slug']}: unknown #{t}" } + c["words"].tally.select { |_, n| n > 1 }.keys.map { |t| "#{c['slug']}: twice #{t}" }
    end
    expect(problems).to be_empty
    expect(collections.map { |c| c["slug"] }.tally.select { |_, n| n > 1 }).to be_empty
  end

  it "builds path units only from collections, lessons and scenarios that exist" do
    path = YAML.load_file(root.join("path.yml"))["units"]
    lessons = YAML.load_file(root.join("listening.yml"))["lessons"].map { |l| l["title"] }
    scenarios = YAML.load_file(root.join("scenarios.yml"))["scenarios"].map { |s| s["slug"] }
    slugs = collections.map { |c| c["slug"] }
    problems = path.flat_map do |u|
      u["steps"].filter_map do |s|
        next if s == "quiz"
        next "#{u['slug']}: collection #{s['words']}" if s["words"] && !slugs.include?(s["words"])
        next "#{u['slug']}: lesson #{s['listening']}" if s["listening"] && !lessons.include?(s["listening"])
        "#{u['slug']}: scenario #{s['scenario']}" if s["scenario"] && !scenarios.include?(s["scenario"])
      end
    end
    expect(problems).to be_empty
    expect(path.map { |u| u["slug"] }.tally.select { |_, n| n > 1 }).to be_empty
    expect(path.flat_map { |u| Array(u["audiences"]) } - (User::FOCUS_ROLES + User::FOCUS_GOALS)).to be_empty
  end

  it "ends every unit with a quiz after at least one words step" do
    path = YAML.load_file(root.join("path.yml"))["units"]
    expect(path.reject { |u| u["steps"].last == "quiz" && u["steps"].any? { |s| s.is_a?(Hash) && s["words"] } }.map { |u| u["slug"] }).to be_empty
  end

  describe "listening lessons" do
    lessons = YAML.load_file(root.join("listening.yml"))["lessons"]

    it "have unique titles, a known level and at least three answerable questions" do
      expect(lessons.map { |l| l["title"] }.tally.select { |_, n| n > 1 }).to be_empty
      problems = lessons.flat_map do |l|
        issues = []
        issues << "#{l['title']}: level" unless Cefr::LEVELS.include?(l["level"])
        issues << "#{l['title']}: fewer than 3 questions" if l["questions"].size < 3
        l["questions"].each do |q|
          issues << "#{l['title']}: '#{q['prompt']}' correct index out of range" unless q["correct"].is_a?(Integer) && q["correct"].between?(0, q["choices"].size - 1)
          issues << "#{l['title']}: '#{q['prompt']}' duplicate choices" if q["choices"].uniq.size != q["choices"].size
        end
        issues
      end
      expect(problems).to be_empty
    end

    it "write each transcript line as 'Speaker: text' with a Vietnamese line for every English line" do
      problems = lessons.filter_map do |l|
        en = l["transcript_en"].strip.lines.map(&:strip).reject(&:empty?)
        vi = l["transcript_vi"].strip.lines.map(&:strip).reject(&:empty?)
        next "#{l['title']}: #{en.size} English lines but #{vi.size} Vietnamese" if en.size != vi.size
        bad = en.reject { |line| line.match?(/\A[^:]{1,40}: \S/) }
        "#{l['title']}: #{bad.first}" if bad.any?
      end
      expect(problems).to be_empty
    end
  end

  describe "scenarios" do
    scenarios = YAML.load_file(root.join("scenarios.yml"))["scenarios"]

    it "have unique slugs and give the learner at least two lines with translations and tips" do
      expect(scenarios.map { |s| s["slug"] }.tally.select { |_, n| n > 1 }).to be_empty
      problems = scenarios.flat_map do |sc|
        issues = []
        mine = sc["lines"].select { |l| l["role"] == "you" }
        issues << "#{sc['slug']}: fewer than 2 learner lines" if mine.size < 2
        sc["lines"].each do |l|
          issues << "#{sc['slug']}: bad role #{l['role']}" unless %w[you other].include?(l["role"])
          issues << "#{sc['slug']}: missing text in '#{l['en']}'" if l["en"].blank? || l["vi"].blank?
        end
        # Short closing lines ("Thanks!") may go without a tip; anything longer teaches something and needs one.
        mine.select { |l| l["tip"].blank? && l["en"].split.size > 5 }.each { |l| issues << "#{sc['slug']}: no tip for '#{l['en']}'" }
        issues
      end
      expect(problems).to be_empty
    end
  end
end
