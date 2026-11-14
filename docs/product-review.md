# Product review and retention plan (2026-11-14)

## What was compared
ForumFlash (`forumflashstudy.com`), viewed in the browser pane: home and the A1 grammar roadmap. The site refuses automated fetches (HTTP 403), so only
what was visible on those two screens is used. Earlier notes in `english-game/docs/compare-forumflash.md` cover the rest.

What ForumFlash does on screen:
- A **learning path**: six CEFR levels (A1–C2), each a chapter with numbered lessons, a ring showing progress per lesson, locked upper levels, and a level test to skip ahead.
- A **growth metaphor**: a seed that becomes a tree over six stages, fed by XP from every finished lesson (progress is never taken away).
- A **streak** shown as a flame with a Monday–Sunday row of dots.
- Four top-level areas: Roadmap, Review, Materials, Tools (for example an IELTS writing grader).
- Big numbers on the home page (101 grammar lessons, 250 vocabulary lessons, 5,000+ words) and illustrated, warm visuals.

## Honest assessment of English for IT today
| Area | State | Why it does not hold people |
|---|---|---|
| Learning engine | Strong: spaced repetition, no-guilt scheduling, audio, quiz modes | Invisible to the user: it is a list of "things to do". |
| Journey | **Missing** | No levels, no path, no "where am I going". Home is a to-do list. Nothing to unlock, nothing that says "you are 40% of the way". |
| Progress feeling | Weak | Plain counters. Nothing grows, nothing is celebrated, no sense of identity ("I am getting better at English for work"). |
| Personalisation | Weak | Two onboarding questions. No role (backend, QA, DevOps, BA, PM), no goal (interview, daily work), no placement test. Everyone gets the same words in the same order. |
| Content depth | Thin | 100 words, 8 lessons, 9 scenarios. A learner finishes the first week of material in days. This is the biggest retention risk. |
| Practical value at work | Not yet used | Nothing to open during a real workday (templates, phrases to copy). |
| Re-engagement | None | No reminders, no weekly recap, no installable app. |
| First impression | Plain | Correct but quiet: no visual story on the landing page, an empty-feeling first session. |
| Quality basics | Good | Responsive, English/Vietnamese, light/dark, accessible, tested, secure. Do not lose this. |

## Principle check
The product rule "no guilt" still stands. Retention here means **positive pull** (visible growth that is never taken away, a clear next step, useful tools),
not fear of losing a streak. Every mechanic below only adds; none subtracts.

## Proposed plan (in order of effect on retention)
1. **Learning path (R1).** Three tracks by level (A2, B1, B2-lite). Each track is a sequence of units such as "Daily standup", "Code review", "Incident update".
   A unit is a fixed route: words → listening → scenario → unit quiz. Progress ring per unit, next unit unlocks at 70% mastery or by a short placement test. Home shows "Next step".
2. **Growth and rhythm (R2), with an IT metaphor.**
   - A **contribution calendar** (GitHub-style heat map) of days studied. Empty days are just empty, never red.
   - A **career ladder** with XP: Intern → Junior → Mid → Senior → Lead. XP only goes up. Level-ups get one calm, short celebration.
   - Optional weekly goal ("3 sessions this week") shown as progress, not as a threat.
3. **Personalisation (R3).** Onboarding adds role and goal; a 10-question placement quiz sets the starting level; the path and the daily mix are tuned to the role.
4. **Workplace toolkit (R4).** Things to open while working, no AI: standup update builder, pull-request comment phrasebook, incident update template, email templates. Everything has a copy button and audio for key phrases.
5. **Re-engagement (R5).** Installable PWA, optional daily reminder (web push), weekly recap, a warm "welcome back" screen.
6. **Content scale (R6).** Target 300 words, 20 listening lessons, 20 scenarios split by role, produced through the existing draft → reviewed → published flow. Needs a domain reviewer.
7. **Measurement.** Basic event log (session started, session finished, day returned) to see day-1 and day-7 return, so changes are judged by numbers.

## Suggested first release
R1 + R2 + the new home screen. Reason: they answer "where am I and what is next" and "I can see myself improving", which is what is missing most. R4 follows because it earns repeat visits during real work.
R6 runs in parallel and is the largest piece of work; it needs a person who can review content.

## Status update (2026-11-14, after the "do everything on free services" round)
| Item | Status |
|---|---|
| R1 learning path, R2 growth | Done (earlier) |
| R3 personalization | Done: role and goal in onboarding and Settings, units for other roles move to the end of a level, "For you" badge, 10-question vocabulary check that suggests a level |
| R4 work toolkit | Done (earlier) |
| R5 re-engagement | Done: installable PWA, daily Web Push reminder at the learner's hour, Monday recap, welcome-back message. Needs VAPID keys and the hourly GitHub Actions trigger |
| R6 content scale | Partly: about 197 words (was 100), 16 path units. Still 8 listening lessons and 9 scenarios. All content is draft |
| R7 measurement | Done: own event log, admin metrics (active users, day-1 and day-7 return, signup funnel), "report a mistake" queue |
| Word mastery | Done: fill-the-gap and say-it quiz modes, vocabulary strength stages on Home, IT pronunciation set |
| Accounts | Done: forgot password, email verification, change password, export, delete |
| Public site | Done: landing demo, glossary, privacy, terms, robots, sitemap, social image |
| Free-tier deployment | Prepared, not deployed: `render.yaml`, Neon, R2, Vercel recipe, Sentry hook, nightly backup workflow |
| Still open | Human review of all content; 20 listening lessons and 20 scenarios; legal review of privacy and terms; first real deployment; CI has never run on GitHub (no remote); native mobile apps are out of scope |
