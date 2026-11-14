# Content review report (2026-11-14)

Scope: `api/db/seeds/it_vocabulary.yml` (40 words, 4 collections), `listening.yml` (3 lessons, 9 questions), `scenarios.yml` (3 scenarios).
Reviewer: an AI assistant (consistency and accuracy pass). **This is not a substitute for sign-off by a native English
speaker and a working software engineer.** IPA was checked against general knowledge, not against a dictionary.

## Checked
- Definitions: every English definition is a single plain sentence at A2–B1 level, using no term that is harder than the word itself.
- Vietnamese meanings: standard IT usage (commit, pull request, staging, production and similar are kept as loan words, with a gloss where useful).
- IPA: General American; stress marks and vowel length checked for all 40 words. Words with an accepted second pronunciation
  (`log` /lɔːɡ/ or /lɑːɡ/, `review` noun /rɪˈvjuː/ or /ˈriːvjuː/) keep the first form.
- Examples: one realistic workplace sentence per word, with a Vietnamese translation; each uses the headword in the stated part of speech.
- Listening: each question has exactly one correct choice that is stated in the transcript; distractors are plausible but not stated.
- Scenarios: lines alternate sensibly between the other person and the learner; learner lines carry a short tip.

## Fixed in this pass
1. Code Review scenario: two learner lines followed each other with no reply in between. Added a colleague line.
2. Bug Investigation scenario: same problem after "I will check the logs…". Added a teammate line.

## Still needs a human
- Native-speaker check of tone and naturalness (especially the tips in the scenarios).
- IT-practitioner check that definitions match how the team uses the terms (for example `staging`, `rollback`, `regression`).
- Dictionary check of IPA before publishing.
- Recorded audio for words and listening lessons.

## Publishing
Content stays `draft` outside development. After the human check, set each item to `reviewed` and then `published` in the admin.

## Second pass: expansion (same day)
Added 60 words, 5 listening lessons and 6 scenarios (see `docs/content/README.md`). Checks done:
- Every new word has a one-sentence A2–B1 definition, a Vietnamese meaning, IPA (General American), an original workplace example with a translation and 1–2 collocations.
- Words with two valid parts of speech are entered once with the sense used at work (`monitor` as a verb, `upgrade` as a verb, `record` as a noun, `duplicate` as a noun, `update` as a noun).
- Listening: one correct answer per question that is stated in the transcript; no distractor is also true. One distractor ("heavier than a phone") was replaced because it was true of any laptop.
- Security content stays general and uncontroversial (long unique passwords, two-factor authentication, report suspicious email). It does not recommend forced periodic password changes.
- Scenario tips teach one functional pattern each: polite requests, 'just to confirm', comparatives with 'but', 'we think' for uncertainty, the three-part interview answer.
Limits are unchanged: not signed off by a native speaker or an engineer, IPA not checked against a dictionary.
