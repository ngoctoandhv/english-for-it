SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: review_logs_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.review_logs_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('app.erase_account', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'review_logs rows are immutable';
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL
);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_attachments_id_seq OWNED BY public.active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    service_name character varying NOT NULL,
    byte_size bigint NOT NULL,
    checksum character varying,
    created_at timestamp(6) without time zone NOT NULL
);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_blobs_id_seq OWNED BY public.active_storage_blobs.id;


--
-- Name: active_storage_variant_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_variant_records (
    id bigint NOT NULL,
    blob_id bigint NOT NULL,
    variation_digest character varying NOT NULL
);


--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_variant_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_variant_records_id_seq OWNED BY public.active_storage_variant_records.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: collection_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collection_words (
    id bigint NOT NULL,
    learning_collection_id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: collection_words_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.collection_words_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collection_words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.collection_words_id_seq OWNED BY public.collection_words.id;


--
-- Name: content_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_reports (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    reportable_type character varying NOT NULL,
    reportable_id bigint NOT NULL,
    message text NOT NULL,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT content_reports_status_check CHECK (((status)::text = ANY (ARRAY[('open'::character varying)::text, ('resolved'::character varying)::text, ('dismissed'::character varying)::text])))
);


--
-- Name: content_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_reports_id_seq OWNED BY public.content_reports.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    user_id bigint,
    name character varying NOT NULL,
    props jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: it_scenarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.it_scenarios (
    id bigint NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    situation text,
    level character varying DEFAULT 'a2'::character varying NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT it_scenarios_level_check CHECK (((level)::text = ANY (ARRAY[('a1'::character varying)::text, ('a2'::character varying)::text, ('b1'::character varying)::text, ('b2'::character varying)::text]))),
    CONSTRAINT it_scenarios_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: it_scenarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.it_scenarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: it_scenarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.it_scenarios_id_seq OWNED BY public.it_scenarios.id;


--
-- Name: learning_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_collections (
    id bigint NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT learning_collections_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: learning_collections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.learning_collections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.learning_collections_id_seq OWNED BY public.learning_collections.id;


--
-- Name: learning_session_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_session_items (
    id bigint NOT NULL,
    learning_session_id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    kind character varying NOT NULL,
    "position" integer NOT NULL,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT items_kind_check CHECK (((kind)::text = ANY (ARRAY[('new'::character varying)::text, ('review'::character varying)::text])))
);


--
-- Name: learning_session_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.learning_session_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_session_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.learning_session_items_id_seq OWNED BY public.learning_session_items.id;


--
-- Name: learning_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    session_date date NOT NULL,
    status character varying DEFAULT 'in_progress'::character varying NOT NULL,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT sessions_status_check CHECK (((status)::text = ANY (ARRAY[('in_progress'::character varying)::text, ('completed'::character varying)::text])))
);


--
-- Name: learning_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.learning_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.learning_sessions_id_seq OWNED BY public.learning_sessions.id;


--
-- Name: listening_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listening_attempts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    listening_lesson_id bigint NOT NULL,
    score integer NOT NULL,
    total integer NOT NULL,
    answers jsonb DEFAULT '[]'::jsonb NOT NULL,
    completed_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: listening_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.listening_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listening_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.listening_attempts_id_seq OWNED BY public.listening_attempts.id;


--
-- Name: listening_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listening_lessons (
    id bigint NOT NULL,
    title character varying NOT NULL,
    description text,
    level character varying DEFAULT 'a2'::character varying NOT NULL,
    transcript_en text NOT NULL,
    transcript_vi text,
    duration_seconds integer,
    "position" integer DEFAULT 0 NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT listening_lessons_level_check CHECK (((level)::text = ANY (ARRAY[('a1'::character varying)::text, ('a2'::character varying)::text, ('b1'::character varying)::text, ('b2'::character varying)::text]))),
    CONSTRAINT listening_lessons_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: listening_lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.listening_lessons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listening_lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.listening_lessons_id_seq OWNED BY public.listening_lessons.id;


--
-- Name: listening_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listening_questions (
    id bigint NOT NULL,
    listening_lesson_id bigint NOT NULL,
    prompt text NOT NULL,
    choices jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_index integer NOT NULL,
    explanation text,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: listening_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.listening_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listening_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.listening_questions_id_seq OWNED BY public.listening_questions.id;


--
-- Name: path_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.path_steps (
    id bigint NOT NULL,
    path_unit_id bigint NOT NULL,
    "position" integer NOT NULL,
    kind character varying NOT NULL,
    learning_collection_id bigint,
    listening_lesson_id bigint,
    it_scenario_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT path_steps_kind_check CHECK (((kind)::text = ANY (ARRAY[('words'::character varying)::text, ('listening'::character varying)::text, ('scenario'::character varying)::text, ('quiz'::character varying)::text]))),
    CONSTRAINT path_steps_one_reference_check CHECK (((((kind)::text = 'quiz'::text) AND (num_nonnulls(learning_collection_id, listening_lesson_id, it_scenario_id) = 0)) OR (((kind)::text <> 'quiz'::text) AND (num_nonnulls(learning_collection_id, listening_lesson_id, it_scenario_id) = 1))))
);


--
-- Name: path_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.path_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: path_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.path_steps_id_seq OWNED BY public.path_steps.id;


--
-- Name: path_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.path_units (
    id bigint NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    level character varying NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    audiences character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    CONSTRAINT path_units_level_check CHECK (((level)::text = ANY (ARRAY[('a1'::character varying)::text, ('a2'::character varying)::text, ('b1'::character varying)::text, ('b2'::character varying)::text]))),
    CONSTRAINT path_units_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: path_units_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.path_units_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: path_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.path_units_id_seq OWNED BY public.path_units.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    endpoint text NOT NULL,
    p256dh character varying NOT NULL,
    auth character varying NOT NULL,
    user_agent character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_digest character varying NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    revoked_at timestamp(6) without time zone,
    user_agent character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: review_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_logs (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    learning_session_item_id bigint,
    rating character varying NOT NULL,
    client_request_id character varying NOT NULL,
    reviewed_at timestamp(6) without time zone NOT NULL,
    state_before jsonb DEFAULT '{}'::jsonb NOT NULL,
    state_after jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT review_logs_rating_check CHECK (((rating)::text = ANY (ARRAY[('again'::character varying)::text, ('hard'::character varying)::text, ('good'::character varying)::text, ('easy'::character varying)::text])))
);


--
-- Name: review_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_logs_id_seq OWNED BY public.review_logs.id;


--
-- Name: scenario_dialogues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_dialogues (
    id bigint NOT NULL,
    it_scenario_id bigint NOT NULL,
    "position" integer NOT NULL,
    speaker character varying NOT NULL,
    role character varying DEFAULT 'other'::character varying NOT NULL,
    text_en text NOT NULL,
    text_vi text,
    tip text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT scenario_dialogues_role_check CHECK (((role)::text = ANY (ARRAY[('other'::character varying)::text, ('you'::character varying)::text])))
);


--
-- Name: scenario_dialogues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scenario_dialogues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scenario_dialogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scenario_dialogues_id_seq OWNED BY public.scenario_dialogues.id;


--
-- Name: scenario_progresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_progresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    it_scenario_id bigint NOT NULL,
    last_position integer DEFAULT 0 NOT NULL,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: scenario_progresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scenario_progresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scenario_progresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scenario_progresses_id_seq OWNED BY public.scenario_progresses.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: toolkit_phrases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.toolkit_phrases (
    id bigint NOT NULL,
    category character varying NOT NULL,
    text_en text NOT NULL,
    text_vi text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT toolkit_phrases_category_check CHECK (((category)::text = ANY (ARRAY[('pr_feedback'::character varying)::text, ('standup'::character varying)::text, ('meeting'::character varying)::text, ('incident'::character varying)::text, ('email'::character varying)::text]))),
    CONSTRAINT toolkit_phrases_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: toolkit_phrases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.toolkit_phrases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: toolkit_phrases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.toolkit_phrases_id_seq OWNED BY public.toolkit_phrases.id;


--
-- Name: unit_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_completions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    path_unit_id bigint NOT NULL,
    completed_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: unit_completions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unit_completions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unit_completions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unit_completions_id_seq OWNED BY public.unit_completions.id;


--
-- Name: unit_quiz_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_quiz_results (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    path_unit_id bigint NOT NULL,
    score integer NOT NULL,
    total integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL
);


--
-- Name: unit_quiz_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unit_quiz_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unit_quiz_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unit_quiz_results_id_seq OWNED BY public.unit_quiz_results.id;


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    favoritable_type character varying NOT NULL,
    favoritable_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_favorites_id_seq OWNED BY public.user_favorites.id;


--
-- Name: user_word_progresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_word_progresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    state character varying DEFAULT 'learning'::character varying NOT NULL,
    due_at timestamp(6) without time zone NOT NULL,
    interval_days integer DEFAULT 0 NOT NULL,
    ease numeric(4,2) DEFAULT 2.5 NOT NULL,
    reps integer DEFAULT 0 NOT NULL,
    lapses integer DEFAULT 0 NOT NULL,
    last_reviewed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT progress_state_check CHECK (((state)::text = ANY (ARRAY[('learning'::character varying)::text, ('review'::character varying)::text])))
);


--
-- Name: user_word_progresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_word_progresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_word_progresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_word_progresses_id_seq OWNED BY public.user_word_progresses.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying NOT NULL,
    password_digest character varying NOT NULL,
    name character varying NOT NULL,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    level character varying,
    daily_goal_minutes integer DEFAULT 10 NOT NULL,
    time_zone character varying DEFAULT 'UTC'::character varying NOT NULL,
    onboarded_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    email_verified_at timestamp(6) without time zone,
    focus_role character varying,
    focus_goal character varying,
    reminder_hour integer,
    reminder_last_sent_on date,
    recap_last_sent_on date,
    new_words_per_day integer,
    CONSTRAINT users_goal_check CHECK ((daily_goal_minutes = ANY (ARRAY[5, 10, 15]))),
    CONSTRAINT users_level_check CHECK (((level IS NULL) OR ((level)::text = ANY (ARRAY[('a1'::character varying)::text, ('a2'::character varying)::text, ('b1'::character varying)::text, ('b2'::character varying)::text])))),
    CONSTRAINT users_new_words_per_day_check CHECK (((new_words_per_day IS NULL) OR ((new_words_per_day >= 1) AND (new_words_per_day <= 100)))),
    CONSTRAINT users_reminder_hour_check CHECK (((reminder_hour IS NULL) OR ((reminder_hour >= 0) AND (reminder_hour <= 23)))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('user'::character varying)::text, ('admin'::character varying)::text])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vocabulary_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_categories (
    id bigint NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: vocabulary_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vocabulary_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vocabulary_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vocabulary_categories_id_seq OWNED BY public.vocabulary_categories.id;


--
-- Name: vocabulary_collocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_collocations (
    id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    phrase character varying NOT NULL,
    translation_vi character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: vocabulary_collocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vocabulary_collocations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vocabulary_collocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vocabulary_collocations_id_seq OWNED BY public.vocabulary_collocations.id;


--
-- Name: vocabulary_examples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_examples (
    id bigint NOT NULL,
    vocabulary_word_id bigint NOT NULL,
    sentence_en text NOT NULL,
    translation_vi text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: vocabulary_examples_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vocabulary_examples_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vocabulary_examples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vocabulary_examples_id_seq OWNED BY public.vocabulary_examples.id;


--
-- Name: vocabulary_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_words (
    id bigint NOT NULL,
    term character varying NOT NULL,
    ipa character varying,
    part_of_speech character varying NOT NULL,
    meaning_vi character varying NOT NULL,
    definition_en text NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    vocabulary_category_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    cefr_level character varying,
    CONSTRAINT vocabulary_words_cefr_level_check CHECK (((cefr_level IS NULL) OR ((cefr_level)::text = ANY (ARRAY[('a1'::character varying)::text, ('a2'::character varying)::text, ('b1'::character varying)::text, ('b2'::character varying)::text])))),
    CONSTRAINT vocabulary_words_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('reviewed'::character varying)::text, ('published'::character varying)::text])))
);


--
-- Name: vocabulary_words_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vocabulary_words_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vocabulary_words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vocabulary_words_id_seq OWNED BY public.vocabulary_words.id;


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('public.active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('public.active_storage_blobs_id_seq'::regclass);


--
-- Name: active_storage_variant_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records ALTER COLUMN id SET DEFAULT nextval('public.active_storage_variant_records_id_seq'::regclass);


--
-- Name: collection_words id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_words ALTER COLUMN id SET DEFAULT nextval('public.collection_words_id_seq'::regclass);


--
-- Name: content_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports ALTER COLUMN id SET DEFAULT nextval('public.content_reports_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: it_scenarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.it_scenarios ALTER COLUMN id SET DEFAULT nextval('public.it_scenarios_id_seq'::regclass);


--
-- Name: learning_collections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_collections ALTER COLUMN id SET DEFAULT nextval('public.learning_collections_id_seq'::regclass);


--
-- Name: learning_session_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session_items ALTER COLUMN id SET DEFAULT nextval('public.learning_session_items_id_seq'::regclass);


--
-- Name: learning_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions ALTER COLUMN id SET DEFAULT nextval('public.learning_sessions_id_seq'::regclass);


--
-- Name: listening_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_attempts ALTER COLUMN id SET DEFAULT nextval('public.listening_attempts_id_seq'::regclass);


--
-- Name: listening_lessons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_lessons ALTER COLUMN id SET DEFAULT nextval('public.listening_lessons_id_seq'::regclass);


--
-- Name: listening_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_questions ALTER COLUMN id SET DEFAULT nextval('public.listening_questions_id_seq'::regclass);


--
-- Name: path_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps ALTER COLUMN id SET DEFAULT nextval('public.path_steps_id_seq'::regclass);


--
-- Name: path_units id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_units ALTER COLUMN id SET DEFAULT nextval('public.path_units_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: review_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_logs ALTER COLUMN id SET DEFAULT nextval('public.review_logs_id_seq'::regclass);


--
-- Name: scenario_dialogues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_dialogues ALTER COLUMN id SET DEFAULT nextval('public.scenario_dialogues_id_seq'::regclass);


--
-- Name: scenario_progresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_progresses ALTER COLUMN id SET DEFAULT nextval('public.scenario_progresses_id_seq'::regclass);


--
-- Name: toolkit_phrases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toolkit_phrases ALTER COLUMN id SET DEFAULT nextval('public.toolkit_phrases_id_seq'::regclass);


--
-- Name: unit_completions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_completions ALTER COLUMN id SET DEFAULT nextval('public.unit_completions_id_seq'::regclass);


--
-- Name: unit_quiz_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_quiz_results ALTER COLUMN id SET DEFAULT nextval('public.unit_quiz_results_id_seq'::regclass);


--
-- Name: user_favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites ALTER COLUMN id SET DEFAULT nextval('public.user_favorites_id_seq'::regclass);


--
-- Name: user_word_progresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_word_progresses ALTER COLUMN id SET DEFAULT nextval('public.user_word_progresses_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vocabulary_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_categories ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_categories_id_seq'::regclass);


--
-- Name: vocabulary_collocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_collocations ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_collocations_id_seq'::regclass);


--
-- Name: vocabulary_examples id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_examples ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_examples_id_seq'::regclass);


--
-- Name: vocabulary_words id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_words ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_words_id_seq'::regclass);


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: active_storage_variant_records active_storage_variant_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT active_storage_variant_records_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: collection_words collection_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_words
    ADD CONSTRAINT collection_words_pkey PRIMARY KEY (id);


--
-- Name: content_reports content_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: it_scenarios it_scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.it_scenarios
    ADD CONSTRAINT it_scenarios_pkey PRIMARY KEY (id);


--
-- Name: learning_collections learning_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_collections
    ADD CONSTRAINT learning_collections_pkey PRIMARY KEY (id);


--
-- Name: learning_session_items learning_session_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session_items
    ADD CONSTRAINT learning_session_items_pkey PRIMARY KEY (id);


--
-- Name: learning_sessions learning_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT learning_sessions_pkey PRIMARY KEY (id);


--
-- Name: listening_attempts listening_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_attempts
    ADD CONSTRAINT listening_attempts_pkey PRIMARY KEY (id);


--
-- Name: listening_lessons listening_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_lessons
    ADD CONSTRAINT listening_lessons_pkey PRIMARY KEY (id);


--
-- Name: listening_questions listening_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_questions
    ADD CONSTRAINT listening_questions_pkey PRIMARY KEY (id);


--
-- Name: path_steps path_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT path_steps_pkey PRIMARY KEY (id);


--
-- Name: path_steps path_steps_position_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT path_steps_position_unique UNIQUE (path_unit_id, "position") DEFERRABLE INITIALLY DEFERRED;


--
-- Name: path_units path_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_units
    ADD CONSTRAINT path_units_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: review_logs review_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_logs
    ADD CONSTRAINT review_logs_pkey PRIMARY KEY (id);


--
-- Name: scenario_dialogues scenario_dialogues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_dialogues
    ADD CONSTRAINT scenario_dialogues_pkey PRIMARY KEY (id);


--
-- Name: scenario_dialogues scenario_dialogues_position_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_dialogues
    ADD CONSTRAINT scenario_dialogues_position_unique UNIQUE (it_scenario_id, "position") DEFERRABLE INITIALLY DEFERRED;


--
-- Name: scenario_progresses scenario_progresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_progresses
    ADD CONSTRAINT scenario_progresses_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: toolkit_phrases toolkit_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toolkit_phrases
    ADD CONSTRAINT toolkit_phrases_pkey PRIMARY KEY (id);


--
-- Name: unit_completions unit_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_completions
    ADD CONSTRAINT unit_completions_pkey PRIMARY KEY (id);


--
-- Name: unit_quiz_results unit_quiz_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_quiz_results
    ADD CONSTRAINT unit_quiz_results_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_word_progresses user_word_progresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_word_progresses
    ADD CONSTRAINT user_word_progresses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_categories vocabulary_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_categories
    ADD CONSTRAINT vocabulary_categories_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_collocations vocabulary_collocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_collocations
    ADD CONSTRAINT vocabulary_collocations_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_examples vocabulary_examples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_examples
    ADD CONSTRAINT vocabulary_examples_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_words vocabulary_words_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_words
    ADD CONSTRAINT vocabulary_words_pkey PRIMARY KEY (id);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON public.active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON public.active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON public.active_storage_blobs USING btree (key);


--
-- Name: index_active_storage_variant_records_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_variant_records_uniqueness ON public.active_storage_variant_records USING btree (blob_id, variation_digest);


--
-- Name: index_collection_words_on_learning_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_collection_words_on_learning_collection_id ON public.collection_words USING btree (learning_collection_id);


--
-- Name: index_collection_words_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_collection_words_on_vocabulary_word_id ON public.collection_words USING btree (vocabulary_word_id);


--
-- Name: index_collection_words_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_collection_words_unique ON public.collection_words USING btree (learning_collection_id, vocabulary_word_id);


--
-- Name: index_content_reports_on_reportable_type_and_reportable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_content_reports_on_reportable_type_and_reportable_id ON public.content_reports USING btree (reportable_type, reportable_id);


--
-- Name: index_content_reports_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_content_reports_on_status ON public.content_reports USING btree (status);


--
-- Name: index_content_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_content_reports_on_user_id ON public.content_reports USING btree (user_id);


--
-- Name: index_events_on_name_and_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_name_and_created_at ON public.events USING btree (name, created_at);


--
-- Name: index_events_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_user_id ON public.events USING btree (user_id);


--
-- Name: index_events_on_user_id_and_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_user_id_and_created_at ON public.events USING btree (user_id, created_at);


--
-- Name: index_it_scenarios_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_it_scenarios_on_slug ON public.it_scenarios USING btree (slug);


--
-- Name: index_items_session_position; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_items_session_position ON public.learning_session_items USING btree (learning_session_id, "position");


--
-- Name: index_items_session_word; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_items_session_word ON public.learning_session_items USING btree (learning_session_id, vocabulary_word_id);


--
-- Name: index_learning_collections_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_learning_collections_on_slug ON public.learning_collections USING btree (slug);


--
-- Name: index_learning_session_items_on_learning_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_learning_session_items_on_learning_session_id ON public.learning_session_items USING btree (learning_session_id);


--
-- Name: index_learning_session_items_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_learning_session_items_on_vocabulary_word_id ON public.learning_session_items USING btree (vocabulary_word_id);


--
-- Name: index_learning_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_learning_sessions_on_user_id ON public.learning_sessions USING btree (user_id);


--
-- Name: index_learning_sessions_on_user_id_and_session_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_learning_sessions_on_user_id_and_session_date ON public.learning_sessions USING btree (user_id, session_date);


--
-- Name: index_listening_attempts_on_listening_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_listening_attempts_on_listening_lesson_id ON public.listening_attempts USING btree (listening_lesson_id);


--
-- Name: index_listening_attempts_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_listening_attempts_on_user_id ON public.listening_attempts USING btree (user_id);


--
-- Name: index_listening_attempts_on_user_id_and_listening_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_listening_attempts_on_user_id_and_listening_lesson_id ON public.listening_attempts USING btree (user_id, listening_lesson_id);


--
-- Name: index_listening_questions_on_listening_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_listening_questions_on_listening_lesson_id ON public.listening_questions USING btree (listening_lesson_id);


--
-- Name: index_path_steps_on_it_scenario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_path_steps_on_it_scenario_id ON public.path_steps USING btree (it_scenario_id);


--
-- Name: index_path_steps_on_learning_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_path_steps_on_learning_collection_id ON public.path_steps USING btree (learning_collection_id);


--
-- Name: index_path_steps_on_listening_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_path_steps_on_listening_lesson_id ON public.path_steps USING btree (listening_lesson_id);


--
-- Name: index_path_steps_on_path_unit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_path_steps_on_path_unit_id ON public.path_steps USING btree (path_unit_id);


--
-- Name: index_path_units_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_path_units_on_slug ON public.path_units USING btree (slug);


--
-- Name: index_progress_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_progress_unique ON public.user_word_progresses USING btree (user_id, vocabulary_word_id);


--
-- Name: index_push_subscriptions_on_endpoint; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_push_subscriptions_on_endpoint ON public.push_subscriptions USING btree (endpoint);


--
-- Name: index_push_subscriptions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_push_subscriptions_on_user_id ON public.push_subscriptions USING btree (user_id);


--
-- Name: index_refresh_tokens_on_token_digest; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_refresh_tokens_on_token_digest ON public.refresh_tokens USING btree (token_digest);


--
-- Name: index_refresh_tokens_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_refresh_tokens_on_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: index_review_logs_idempotency; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_review_logs_idempotency ON public.review_logs USING btree (user_id, client_request_id);


--
-- Name: index_review_logs_on_learning_session_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_review_logs_on_learning_session_item_id ON public.review_logs USING btree (learning_session_item_id);


--
-- Name: index_review_logs_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_review_logs_on_user_id ON public.review_logs USING btree (user_id);


--
-- Name: index_review_logs_on_user_id_and_reviewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_review_logs_on_user_id_and_reviewed_at ON public.review_logs USING btree (user_id, reviewed_at);


--
-- Name: index_review_logs_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_review_logs_on_vocabulary_word_id ON public.review_logs USING btree (vocabulary_word_id);


--
-- Name: index_scenario_dialogues_on_it_scenario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_scenario_dialogues_on_it_scenario_id ON public.scenario_dialogues USING btree (it_scenario_id);


--
-- Name: index_scenario_progress_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_scenario_progress_unique ON public.scenario_progresses USING btree (user_id, it_scenario_id);


--
-- Name: index_scenario_progresses_on_it_scenario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_scenario_progresses_on_it_scenario_id ON public.scenario_progresses USING btree (it_scenario_id);


--
-- Name: index_scenario_progresses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_scenario_progresses_on_user_id ON public.scenario_progresses USING btree (user_id);


--
-- Name: index_sessions_one_open_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_sessions_one_open_per_user ON public.learning_sessions USING btree (user_id) WHERE ((status)::text = 'in_progress'::text);


--
-- Name: index_toolkit_phrases_on_category_and_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_toolkit_phrases_on_category_and_position ON public.toolkit_phrases USING btree (category, "position");


--
-- Name: index_unit_completions_on_path_unit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_unit_completions_on_path_unit_id ON public.unit_completions USING btree (path_unit_id);


--
-- Name: index_unit_completions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_unit_completions_on_user_id ON public.unit_completions USING btree (user_id);


--
-- Name: index_unit_completions_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_unit_completions_unique ON public.unit_completions USING btree (user_id, path_unit_id);


--
-- Name: index_unit_quiz_results_on_path_unit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_unit_quiz_results_on_path_unit_id ON public.unit_quiz_results USING btree (path_unit_id);


--
-- Name: index_unit_quiz_results_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_unit_quiz_results_on_user_id ON public.unit_quiz_results USING btree (user_id);


--
-- Name: index_unit_quiz_results_on_user_id_and_path_unit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_unit_quiz_results_on_user_id_and_path_unit_id ON public.unit_quiz_results USING btree (user_id, path_unit_id);


--
-- Name: index_user_favorites_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_favorites_on_user_id ON public.user_favorites USING btree (user_id);


--
-- Name: index_user_favorites_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_user_favorites_unique ON public.user_favorites USING btree (user_id, favoritable_type, favoritable_id);


--
-- Name: index_user_word_progresses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_word_progresses_on_user_id ON public.user_word_progresses USING btree (user_id);


--
-- Name: index_user_word_progresses_on_user_id_and_due_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_word_progresses_on_user_id_and_due_at ON public.user_word_progresses USING btree (user_id, due_at);


--
-- Name: index_user_word_progresses_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_word_progresses_on_vocabulary_word_id ON public.user_word_progresses USING btree (vocabulary_word_id);


--
-- Name: index_users_on_lower_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_lower_email ON public.users USING btree (lower((email)::text));


--
-- Name: index_vocabulary_categories_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_vocabulary_categories_on_slug ON public.vocabulary_categories USING btree (slug);


--
-- Name: index_vocabulary_collocations_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vocabulary_collocations_on_vocabulary_word_id ON public.vocabulary_collocations USING btree (vocabulary_word_id);


--
-- Name: index_vocabulary_examples_on_vocabulary_word_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vocabulary_examples_on_vocabulary_word_id ON public.vocabulary_examples USING btree (vocabulary_word_id);


--
-- Name: index_vocabulary_words_on_cefr_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vocabulary_words_on_cefr_level ON public.vocabulary_words USING btree (cefr_level);


--
-- Name: index_vocabulary_words_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vocabulary_words_on_status ON public.vocabulary_words USING btree (status);


--
-- Name: index_vocabulary_words_on_term_and_pos; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_vocabulary_words_on_term_and_pos ON public.vocabulary_words USING btree (lower((term)::text), part_of_speech);


--
-- Name: index_vocabulary_words_on_vocabulary_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vocabulary_words_on_vocabulary_category_id ON public.vocabulary_words USING btree (vocabulary_category_id);


--
-- Name: review_logs review_logs_no_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER review_logs_no_change BEFORE DELETE OR UPDATE ON public.review_logs FOR EACH ROW EXECUTE FUNCTION public.review_logs_immutable();


--
-- Name: listening_attempts fk_rails_086ffba213; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_attempts
    ADD CONSTRAINT fk_rails_086ffba213 FOREIGN KEY (listening_lesson_id) REFERENCES public.listening_lessons(id) ON DELETE CASCADE;


--
-- Name: listening_questions fk_rails_08d52369e8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_questions
    ADD CONSTRAINT fk_rails_08d52369e8 FOREIGN KEY (listening_lesson_id) REFERENCES public.listening_lessons(id) ON DELETE CASCADE;


--
-- Name: events fk_rails_0cb5590091; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_rails_0cb5590091 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scenario_progresses fk_rails_172200a183; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_progresses
    ADD CONSTRAINT fk_rails_172200a183 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: path_steps fk_rails_1c0acdb3f6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT fk_rails_1c0acdb3f6 FOREIGN KEY (path_unit_id) REFERENCES public.path_units(id) ON DELETE CASCADE;


--
-- Name: user_favorites fk_rails_25ed4cb388; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT fk_rails_25ed4cb388 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens fk_rails_279e9a0091; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_rails_279e9a0091 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: path_steps fk_rails_3f8de292d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT fk_rails_3f8de292d5 FOREIGN KEY (learning_collection_id) REFERENCES public.learning_collections(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions fk_rails_43d43720fc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT fk_rails_43d43720fc FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: path_steps fk_rails_49b91f9803; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT fk_rails_49b91f9803 FOREIGN KEY (listening_lesson_id) REFERENCES public.listening_lessons(id) ON DELETE CASCADE;


--
-- Name: unit_completions fk_rails_4a834447c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_completions
    ADD CONSTRAINT fk_rails_4a834447c2 FOREIGN KEY (path_unit_id) REFERENCES public.path_units(id) ON DELETE CASCADE;


--
-- Name: collection_words fk_rails_518d478644; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_words
    ADD CONSTRAINT fk_rails_518d478644 FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE CASCADE;


--
-- Name: unit_quiz_results fk_rails_56cd458d88; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_quiz_results
    ADD CONSTRAINT fk_rails_56cd458d88 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: collection_words fk_rails_63efa23848; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_words
    ADD CONSTRAINT fk_rails_63efa23848 FOREIGN KEY (learning_collection_id) REFERENCES public.learning_collections(id) ON DELETE CASCADE;


--
-- Name: unit_quiz_results fk_rails_68a8b6cd38; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_quiz_results
    ADD CONSTRAINT fk_rails_68a8b6cd38 FOREIGN KEY (path_unit_id) REFERENCES public.path_units(id) ON DELETE CASCADE;


--
-- Name: unit_completions fk_rails_6b6c2c559d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_completions
    ADD CONSTRAINT fk_rails_6b6c2c559d FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_word_progresses fk_rails_70e0c7be0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_word_progresses
    ADD CONSTRAINT fk_rails_70e0c7be0f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_logs fk_rails_815271848e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_logs
    ADD CONSTRAINT fk_rails_815271848e FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE RESTRICT;


--
-- Name: listening_attempts fk_rails_8427df0adf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_attempts
    ADD CONSTRAINT fk_rails_8427df0adf FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: learning_session_items fk_rails_8d37470bbe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session_items
    ADD CONSTRAINT fk_rails_8d37470bbe FOREIGN KEY (learning_session_id) REFERENCES public.learning_sessions(id) ON DELETE CASCADE;


--
-- Name: active_storage_variant_records fk_rails_993965df05; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT fk_rails_993965df05 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: content_reports fk_rails_ab5b545b3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT fk_rails_ab5b545b3f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: path_steps fk_rails_bad9e0472b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.path_steps
    ADD CONSTRAINT fk_rails_bad9e0472b FOREIGN KEY (it_scenario_id) REFERENCES public.it_scenarios(id) ON DELETE CASCADE;


--
-- Name: active_storage_attachments fk_rails_c3b3935057; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_c3b3935057 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: review_logs fk_rails_c70316ce55; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_logs
    ADD CONSTRAINT fk_rails_c70316ce55 FOREIGN KEY (learning_session_item_id) REFERENCES public.learning_session_items(id) ON DELETE SET NULL;


--
-- Name: review_logs fk_rails_cbe55fa148; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_logs
    ADD CONSTRAINT fk_rails_cbe55fa148 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: vocabulary_examples fk_rails_ccbe9c0d60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_examples
    ADD CONSTRAINT fk_rails_ccbe9c0d60 FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE CASCADE;


--
-- Name: scenario_progresses fk_rails_cd24d3e3ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_progresses
    ADD CONSTRAINT fk_rails_cd24d3e3ab FOREIGN KEY (it_scenario_id) REFERENCES public.it_scenarios(id) ON DELETE CASCADE;


--
-- Name: user_word_progresses fk_rails_cdac90163a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_word_progresses
    ADD CONSTRAINT fk_rails_cdac90163a FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE CASCADE;


--
-- Name: vocabulary_words fk_rails_cf16459f53; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_words
    ADD CONSTRAINT fk_rails_cf16459f53 FOREIGN KEY (vocabulary_category_id) REFERENCES public.vocabulary_categories(id) ON DELETE RESTRICT;


--
-- Name: learning_session_items fk_rails_d1cd878b09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session_items
    ADD CONSTRAINT fk_rails_d1cd878b09 FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE CASCADE;


--
-- Name: learning_sessions fk_rails_e54f74cd15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT fk_rails_e54f74cd15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scenario_dialogues fk_rails_eb47113a4f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario_dialogues
    ADD CONSTRAINT fk_rails_eb47113a4f FOREIGN KEY (it_scenario_id) REFERENCES public.it_scenarios(id) ON DELETE CASCADE;


--
-- Name: vocabulary_collocations fk_rails_ee0e991115; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_collocations
    ADD CONSTRAINT fk_rails_ee0e991115 FOREIGN KEY (vocabulary_word_id) REFERENCES public.vocabulary_words(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20261114220002'),
('20261114220001'),
('20261114210001'),
('20261114200001'),
('20261114190001'),
('20261114180001'),
('20261114170001'),
('20261114160001'),
('20261114150001'),
('20261114140001'),
('20261114130001'),
('20261114120001'),
('20261114110001'),
('20261114100002'),
('20261114100001');

