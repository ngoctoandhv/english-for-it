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
