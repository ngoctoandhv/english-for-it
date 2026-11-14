# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_14_110001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "collection_words", force: :cascade do |t|
    t.bigint "learning_collection_id", null: false
    t.bigint "vocabulary_word_id", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["learning_collection_id", "vocabulary_word_id"], name: "index_collection_words_unique", unique: true
    t.index ["learning_collection_id"], name: "index_collection_words_on_learning_collection_id"
    t.index ["vocabulary_word_id"], name: "index_collection_words_on_vocabulary_word_id"
  end

  create_table "learning_collections", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "status", default: "draft", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_learning_collections_on_slug", unique: true
    t.check_constraint "status::text = ANY (ARRAY['draft'::character varying, 'reviewed'::character varying, 'published'::character varying]::text[])", name: "learning_collections_status_check"
  end

  create_table "refresh_tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token_digest", null: false
    t.datetime "expires_at", null: false
    t.datetime "revoked_at"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token_digest"], name: "index_refresh_tokens_on_token_digest", unique: true
    t.index ["user_id"], name: "index_refresh_tokens_on_user_id"
  end

  create_table "user_favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "favoritable_type", null: false
    t.bigint "favoritable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "favoritable_type", "favoritable_id"], name: "index_user_favorites_unique", unique: true
    t.index ["user_id"], name: "index_user_favorites_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "name", null: false
    t.string "role", default: "user", null: false
    t.string "level"
    t.integer "daily_goal_minutes", default: 10, null: false
    t.string "time_zone", default: "UTC", null: false
    t.datetime "onboarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.check_constraint "daily_goal_minutes = ANY (ARRAY[5, 10, 15])", name: "users_goal_check"
    t.check_constraint "role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying]::text[])", name: "users_role_check"
  end

  create_table "vocabulary_categories", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_vocabulary_categories_on_slug", unique: true
  end

  create_table "vocabulary_collocations", force: :cascade do |t|
    t.bigint "vocabulary_word_id", null: false
    t.string "phrase", null: false
    t.string "translation_vi"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["vocabulary_word_id"], name: "index_vocabulary_collocations_on_vocabulary_word_id"
  end

  create_table "vocabulary_examples", force: :cascade do |t|
    t.bigint "vocabulary_word_id", null: false
    t.text "sentence_en", null: false
    t.text "translation_vi", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["vocabulary_word_id"], name: "index_vocabulary_examples_on_vocabulary_word_id"
  end

  create_table "vocabulary_words", force: :cascade do |t|
    t.string "term", null: false
    t.string "ipa"
    t.string "part_of_speech", null: false
    t.string "meaning_vi", null: false
    t.text "definition_en", null: false
    t.string "status", default: "draft", null: false
    t.bigint "vocabulary_category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((term)::text), part_of_speech", name: "index_vocabulary_words_on_term_and_pos", unique: true
    t.index ["status"], name: "index_vocabulary_words_on_status"
    t.index ["vocabulary_category_id"], name: "index_vocabulary_words_on_vocabulary_category_id"
    t.check_constraint "status::text = ANY (ARRAY['draft'::character varying, 'reviewed'::character varying, 'published'::character varying]::text[])", name: "vocabulary_words_status_check"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "collection_words", "learning_collections", on_delete: :cascade
  add_foreign_key "collection_words", "vocabulary_words", on_delete: :cascade
  add_foreign_key "refresh_tokens", "users"
  add_foreign_key "user_favorites", "users", on_delete: :cascade
  add_foreign_key "vocabulary_collocations", "vocabulary_words", on_delete: :cascade
  add_foreign_key "vocabulary_examples", "vocabulary_words", on_delete: :cascade
  add_foreign_key "vocabulary_words", "vocabulary_categories", on_delete: :restrict
end
