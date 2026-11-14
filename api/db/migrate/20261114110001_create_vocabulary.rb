class CreateVocabulary < ActiveRecord::Migration[8.1]
  def change
    create_table :vocabulary_categories do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :vocabulary_categories, :slug, unique: true

    create_table :vocabulary_words do |t|
      t.string :term, null: false
      t.string :ipa
      t.string :part_of_speech, null: false
      t.string :meaning_vi, null: false
      t.text :definition_en, null: false
      t.string :status, null: false, default: "draft"
      t.references :vocabulary_category, foreign_key: { on_delete: :restrict }
      t.timestamps
    end
    add_index :vocabulary_words, "lower(term), part_of_speech", unique: true, name: "index_vocabulary_words_on_term_and_pos"
    add_index :vocabulary_words, :status
    add_check_constraint :vocabulary_words, "status IN ('draft','reviewed','published')", name: "vocabulary_words_status_check"

    create_table :vocabulary_examples do |t|
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :cascade }
      t.text :sentence_en, null: false
      t.text :translation_vi, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end

    create_table :vocabulary_collocations do |t|
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :cascade }
      t.string :phrase, null: false
      t.string :translation_vi
      t.timestamps
    end

    create_table :learning_collections do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :description
      t.string :status, null: false, default: "draft"
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :learning_collections, :slug, unique: true
    add_check_constraint :learning_collections, "status IN ('draft','reviewed','published')", name: "learning_collections_status_check"

    create_table :collection_words do |t|
      t.references :learning_collection, null: false, foreign_key: { on_delete: :cascade }
      t.references :vocabulary_word, null: false, foreign_key: { on_delete: :cascade }
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :collection_words, %i[learning_collection_id vocabulary_word_id], unique: true, name: "index_collection_words_unique"

    create_table :user_favorites do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :favoritable_type, null: false
      t.bigint :favoritable_id, null: false
      t.timestamps
    end
    add_index :user_favorites, %i[user_id favoritable_type favoritable_id], unique: true, name: "index_user_favorites_unique"
  end
end
