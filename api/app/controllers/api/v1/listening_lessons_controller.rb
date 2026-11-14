module Api
  module V1
    class ListeningLessonsController < BaseController
      include Authenticatable

      def index
        lessons = ListeningLesson.published.ordered.includes(:listening_questions, audio_attachment: :blob)
        best = current_user.listening_attempts.group(:listening_lesson_id).maximum(:score)
        totals = current_user.listening_attempts.group(:listening_lesson_id).count
        render json: { data: lessons.map { |l| ListeningSerializer.summary(l, best: totals.key?(l.id) ? best[l.id] : nil) } }
      end

      def show
        lesson = published_lesson
        best = current_user.listening_attempts.where(listening_lesson: lesson).maximum(:score)
        render json: { data: ListeningSerializer.detail(lesson, best: best) }
      end

      def attempt
        lesson = published_lesson
        raw = params.expect(answers: [ %i[question_id choice_index] ])
        grade = ListeningGrader.call(lesson, raw.map(&:to_h).map(&:symbolize_keys))
        current_user.listening_attempts.create!(listening_lesson: lesson, score: grade.score, total: grade.total,
                                                answers: grade.results.map { |r| r.slice(:question_id, :choice_index) }, completed_at: Time.current)
        newly = Path::Completions.sync!(current_user)
        render json: { data: { score: grade.score, total: grade.total, results: grade.results,
                               units_completed: newly.map { |u| { slug: u.slug, title: u.title } } } }, status: :created
      end

      private

      def published_lesson
        ListeningLesson.published.includes(:listening_questions, audio_attachment: :blob).find(params[:id])
      end
    end
  end
end
