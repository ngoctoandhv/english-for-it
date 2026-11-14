# Content review

Seed content lives in `api/db/seeds/it_vocabulary.yml` and is **draft**: not reviewed by a domain expert.
- Development: `bin/rails db:seed` publishes it so the app is usable.
- Elsewhere: it is imported with status `draft`. An admin reviews each word (Admin → Vocabulary), sets `reviewed`, then `published`.
- Definitions are deliberately simple and conservative. Anything doubtful should be edited or removed before publishing.
- IPA transcriptions use General American; verify against a dictionary before publishing.
