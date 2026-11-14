module Stats
  # How well the learner knows the published words. Stages are disjoint and follow the review interval:
  #   unseen    never studied
  #   learning  interval under 1 day
  #   familiar  1-6 days
  #   solid     7-20 days (recalled after a week or more)
  #   mastered  21+ days
  # solid_soon is the part of "familiar" (3+ days) that the next correct review pushes into "solid".
  class Vocabulary
    SOLID_DAYS = 7
    MASTERED_DAYS = 21
    SOON_DAYS = 3

    def initialize(user)
      @user = user
    end

    def call
      progress = @user.user_word_progresses.joins(:vocabulary_word).merge(VocabularyWord.published)
      total = VocabularyWord.published.count
      row = progress.pick(
        Arel.sql("COUNT(*) FILTER (WHERE interval_days < 1)"),
        Arel.sql("COUNT(*) FILTER (WHERE interval_days >= 1 AND interval_days < #{SOLID_DAYS})"),
        Arel.sql("COUNT(*) FILTER (WHERE interval_days >= #{SOLID_DAYS} AND interval_days < #{MASTERED_DAYS})"),
        Arel.sql("COUNT(*) FILTER (WHERE interval_days >= #{MASTERED_DAYS})"),
        Arel.sql("COUNT(*) FILTER (WHERE interval_days >= #{SOON_DAYS} AND interval_days < #{SOLID_DAYS})")
      )
      learning, familiar, solid, mastered, soon = row.map(&:to_i)
      {
        total: total,
        unseen: total - (learning + familiar + solid + mastered),
        learning: learning,
        familiar: familiar,
        solid: solid,
        mastered: mastered,
        solid_soon: soon
      }
    end
  end
end
