# Content review

Seed content lives in `api/db/seeds/it_vocabulary.yml` and is **draft**: not reviewed by a domain expert.
- Development: `bin/rails db:seed` publishes it so the app is usable.
- Elsewhere: it is imported with status `draft`. An admin reviews each word (Admin → Vocabulary), sets `reviewed`, then `published`.
- Definitions are deliberately simple and conservative. Anything doubtful should be edited or removed before publishing.
- IPA transcriptions use General American; verify against a dictionary before publishing.

## Scope after the content expansion
| Type | Count | Topics |
|---|---|---|
| Words | 100 | version control, code review, debugging, agile and standup, deployment, communication, hardware, networking, security, cloud, data, meetings and email, job interviews, describing and comparing |
| Collections | 10 | Daily Standup, Code Review, Bug Investigation, Deploy & Release, Devices & Hardware, Networking & Security, Cloud & Data, Meetings & Email, Job Interview, Describing & Comparing |
| Listening lessons | 8 | A2–B1 workplace dialogues, 3 questions each (4 for the interview lesson) |
| Scenarios | 9 | standup, code review, bug investigation, incident update, asking for clarification, commenting on a ticket, tell me about yourself, comparing two options, asking IT support |

Design basis: the topic areas and the functional language (advice and requests, describing and comparing, giving updates, problem reporting, interview answers)
follow the public syllabi of English for IT (OpenEDG, A2–B2) and English4IT. No text from those courses is copied; all sentences are original.
The Cisco Networking Academy "Describing and Comparing" page could not be read (it needs JavaScript), so that course's module list was not used.
Quizlet could not be read either (HTTP 403). The quiz modes (choose, listen, type) and the "next review" feedback follow common study-app patterns and Lingvist's public description.

## Work toolkit content
`api/db/seeds/toolkit.yml` holds 49 phrases in five categories (pull request feedback, standup, meetings, incidents, email). Same status as the rest: draft until reviewed.
Verb glosses for the standup builder live in `web/src/lib/toolkit/standup.ts`, and the email templates in `web/src/lib/toolkit/email.ts`; both need the same human review before being promoted as "correct" workplace English.


## Batch 2 (2026-11-14): 97 more words, 7 collections, 7 path units
`api/db/seeds/it_vocabulary_2.yml` adds testing/QA, CI/CD and DevOps, APIs and architecture, frontend and backend, projects and planning, working together
and a "Say It Right" set of IT words that learners often pronounce wrongly (cache, queue, daemon, SQL, Kubernetes...). Library: about 197 published
words in development. All of it is DRAFT: Vietnamese meanings, definitions, IPA and examples were written by an AI assistant and need a native speaker and an
engineer to review. Voice files for the new words and their examples were generated with Kokoro (`bin/audio`).
The path units for the new collections use words and a unit quiz only (no listening or scenario step yet).

## Adding content without code
Admin → Vocabulary → **Import CSV** adds or updates words in bulk (dry-run check first). Admin → **Path units** edits units, their audiences and steps
(`words:slug`, `listening:id`, `scenario:slug`, `quiz`, one per line).

## Batch 3 (2026-11-14): everyday English, 97 entries
`api/db/seeds/it_vocabulary_3.yml`: small talk, polite requests, opinions and agreeing, time and plans, feelings and reactions, calls and video meetings,
office life, clarifying and checking. Many entries are phrases (part of speech "phrase", stored without final punctuation, for example
"could you repeat that"). 8 new path units use them. Library total: about 294 words and phrases. Still DRAFT and needs a native speaker's review.

## Automatic content checks
`api/spec/content/seed_content_spec.rb` runs with RSpec and fails on: duplicate term + part of speech, missing fields, unknown category or part of speech,
IPA not written as `/.../`, an example that does not contain its word (fill-the-gap needs it), missing final punctuation, collections or path steps
that point to missing content, unknown audiences. It cannot judge whether the English or the Vietnamese is right; that still needs a person.

## Everyday listening and scenarios (2026-11-14)
8 listening lessons (small talk, asking for help, a video call with problems, asking someone to repeat, running late, a day off, agreeing and
disagreeing, good and bad news) and 8 scripted scenarios on the same topics. Each everyday path unit is now words → listening → scenario → quiz.
Totals: 16 listening lessons, 17 scenarios. Multi-voice audio generated with Kokoro. DRAFT: needs a native speaker's review.
The seed content spec now also checks listening lessons (unique titles, at least 3 questions, valid answer index, no duplicate choices,
"Speaker: text" lines with a Vietnamese line for each English line) and scenarios (unique slugs, at least 2 learner lines, translations,
a tip on every learner line longer than five words).

## CEFR levels (2026-11-14)
Every category has a level (the level of the situation, for example small talk A1, standups A2, testing B1, APIs B2) and a word inherits it unless it sets
`lv`. About 23 words have their own level. Path units, lessons and scenarios have a level too (lessons and scenarios take the level of the unit that uses them).
These levels are an author's estimate, not checked against the English Vocabulary Profile or another CEFR word list; a reviewer should confirm them.
Current spread of published words: A1 40, A2 106, B1 112, B2 36. A1 and B2 are thin and need more content.

## Batch 4 (2026-11-14): A1 and B2
`api/db/seeds/it_vocabulary_4.yml`: A1 (introducing yourself, computer basics, your work day) and B2 (leading and influencing, advanced architecture,
presenting and writing), 97 entries. Plus 2 A1 and 2 B2 listening lessons, 2 A1 and 2 B2 scenarios, and 6 path units.
Totals: about 385 words and phrases (A1 90, A2 106, B1 112, B2 77), 20 listening lessons, 21 scenarios, 30 path units (A1 8, A2 7, B1 8, B2 7).
Voice files generated with Kokoro. DRAFT: needs a native speaker's review; the CEFR levels are estimates.
