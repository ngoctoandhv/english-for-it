module Growth
  # XP only goes up: every source is a fact that is never removed (reviews, words reviewed at least once,
  # passed listening lessons, completed scenarios, persisted unit completions).
  class Xp
    PER_REVIEW = 1
    PER_NEW_WORD = 3
    PER_LISTENING = 15
    PER_SCENARIO = 15
    PER_UNIT = 50

    # Career ladder: rank key => XP needed.
    RANKS = [ %w[intern 0], %w[junior 100], %w[mid 400], %w[senior 1000], %w[lead 2500] ].map { |k, xp| [ k, xp.to_i ] }.freeze

    def initialize(user)
      @user = user
    end

    def call
      progress = Path::Progress.new(@user)
      xp = @user.review_logs.count * PER_REVIEW +
           progress.learned_word_ids.size * PER_NEW_WORD +
           progress.listening_passed_count * PER_LISTENING +
           progress.scenarios_completed_count * PER_SCENARIO +
           @user.unit_completions.count * PER_UNIT
      rank_for(xp)
    end

    def rank_for(xp)
      index = RANKS.rindex { |_, need| xp >= need }
      current = RANKS[index]
      upcoming = RANKS[index + 1]
      {
        xp: xp,
        rank: { key: current[0], index: index, xp: current[1] },
        next_rank: upcoming && { key: upcoming[0], index: index + 1, xp: upcoming[1] },
        progress_to_next: upcoming ? ((xp - current[1]) * 100.0 / (upcoming[1] - current[1])).round : 100
      }
    end
  end
end
