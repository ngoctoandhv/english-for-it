require "csv"

module Vocabulary
  # Bulk add or update words from CSV. One row per word. Columns (header row required):
  #   term, part_of_speech, meaning_vi, definition_en            required
  #   ipa, category, example_en, example_vi, collocations, status optional (collocations separated by ";")
  # A word is identified by term + part_of_speech: an existing one is updated, otherwise it is created as draft.
  # With dry_run the whole file is checked and nothing is saved.
  class CsvImport
    MAX_ROWS = 500
    MAX_BYTES = 1.megabyte
    REQUIRED = %w[term part_of_speech meaning_vi definition_en].freeze

    Result = Struct.new(:created, :updated, :errors, keyword_init: true)

    def self.call(text, dry_run: false) = new(text, dry_run).call

    def initialize(text, dry_run)
      @text = text.to_s.delete_prefix("﻿")
      @dry_run = dry_run
    end

    def call
      result = Result.new(created: 0, updated: 0, errors: [])
      return fail_with(result, 0, "File is larger than #{MAX_BYTES / 1.kilobyte} KB") if @text.bytesize > MAX_BYTES

      rows = parse(result)
      return result unless rows
      return fail_with(result, 0, "No rows found") if rows.empty?
      return fail_with(result, 0, "More than #{MAX_ROWS} rows; split the file") if rows.size > MAX_ROWS

      ActiveRecord::Base.transaction do
        rows.each_with_index { |row, i| import_row(row, i + 2, result) }
        raise ActiveRecord::Rollback if @dry_run || result.errors.any?
      end
      result.created = result.updated = 0 if result.errors.any?
      result
    end

    private

    def parse(result)
      table = CSV.parse(@text, headers: true, header_converters: ->(h) { h.to_s.strip.downcase })
      missing = REQUIRED - table.headers.compact
      return fail_with(result, 1, "Missing columns: #{missing.join(', ')}") && nil if missing.any?

      table.map(&:to_h)
    rescue CSV::MalformedCSVError => e
      fail_with(result, 0, "Not valid CSV: #{e.message}")
      nil
    end

    def fail_with(result, row, message)
      result.errors << { row: row, message: message }
      result
    end

    def import_row(row, line, result)
      word = VocabularyWord.find_or_initialize_by(term: row["term"].to_s.strip, part_of_speech: row["part_of_speech"].to_s.strip)
      was_new = word.new_record?
      word.assign_attributes(meaning_vi: row["meaning_vi"].to_s.strip, definition_en: row["definition_en"].to_s.strip)
      word.ipa = row["ipa"].strip if row["ipa"].present?
      word.vocabulary_category = category(row["category"]) if row["category"].present?
      word.status = row["status"].presence || (was_new ? "draft" : word.status)
      unless word.valid?
        return result.errors << { row: line, message: "#{row['term']}: #{word.errors.full_messages.to_sentence}" }
      end

      word.save!
      save_example(word, row)
      row["collocations"].to_s.split(";").map(&:strip).reject(&:blank?).each { |c| word.vocabulary_collocations.find_or_create_by!(phrase: c) }
      was_new ? result.created += 1 : result.updated += 1
    end

    def save_example(word, row)
      return if row["example_en"].blank? || row["example_vi"].blank?

      example = word.vocabulary_examples.order(:position, :id).first || word.vocabulary_examples.build
      example.update!(sentence_en: row["example_en"].strip, translation_vi: row["example_vi"].strip, position: 0)
    end

    def category(name)
      slug = name.to_s.strip.parameterize
      VocabularyCategory.find_by(slug: slug) || VocabularyCategory.find_by("LOWER(name) = ?", name.to_s.strip.downcase) ||
        VocabularyCategory.create!(name: name.to_s.strip, slug: slug, position: VocabularyCategory.maximum(:position).to_i + 1)
    end
  end
end
