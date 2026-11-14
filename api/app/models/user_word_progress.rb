class UserWordProgress < ApplicationRecord
  belongs_to :user
  belongs_to :vocabulary_word

  validates :vocabulary_word_id, uniqueness: { scope: :user_id }

  def to_state
    Scheduling::State.new(state: state, due_at: due_at, interval_days: interval_days, ease: ease.to_f, reps: reps, lapses: lapses)
  end

  def apply!(new_state, reviewed_at:)
    update!(state: new_state.state, due_at: new_state.due_at, interval_days: new_state.interval_days,
            ease: new_state.ease, reps: new_state.reps, lapses: new_state.lapses, last_reviewed_at: reviewed_at)
  end
end
