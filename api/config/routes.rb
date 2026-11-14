Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      post "auth/refresh", to: "auth#refresh"
      delete "auth/logout", to: "auth#logout"
      post "auth/password/forgot", to: "passwords#forgot"
      post "auth/password/reset", to: "passwords#reset"
      post "auth/email/verify", to: "email_verifications#verify"

      resources :categories, only: :index
      resources :words, only: %i[index show]
      resources :collections, only: %i[index show]
      get "favorites", to: "favorites#index"
      post "favorites", to: "favorites#create"
      delete "favorites/:type/:id", to: "favorites#destroy"

      get "dashboard", to: "dashboard#show"
      get "growth", to: "growth#show"
      get "toolkit/phrases", to: "toolkit_phrases#index"
      get "path", to: "path#index"
      get "path/units/:id", to: "path#show"
      get "path/units/:id/quiz", to: "path#quiz"
      post "path/units/:id/quiz/answers", to: "path#answers"
      get "progress", to: "progress#show"
      get "history", to: "progress#history"
      get "public/sample", to: "public#sample"
      get "public/words", to: "public#words"
      get "push/key", to: "push#key"
      post "push/subscriptions", to: "push#subscribe"
      delete "push/subscriptions", to: "push#unsubscribe"
      post "push/test", to: "push#test"
      post "internal/reminders", to: "internal#reminders"
      post "events", to: "events#create"
      post "reports", to: "reports#create"
      get "placement", to: "placement#show"
      post "placement/answers", to: "placement#answers"
      get "quizzes/quick", to: "quizzes#quick"
      post "quizzes/quick/answers", to: "quizzes#answers"

      resources :listening_lessons, only: %i[index show] do
        post :attempts, on: :member, action: :attempt
      end

      resources :scenarios, only: %i[index show] do
        post :progress, on: :member
      end

      resources :learning_sessions, only: %i[create show] do
        post :complete, on: :member
      end
      resources :reviews, only: :create do
        get :due, on: :collection
      end

      namespace :admin do
        get "metrics", to: "metrics#show"
        resources :reports, controller: "content_reports", only: %i[index show update destroy]
        resources :categories, controller: "vocabulary_categories", except: %i[new edit]
        post "words/import", to: "word_imports#create"
        resources :units, controller: "path_units", except: %i[new edit]
        resources :words, controller: "vocabulary_words", except: %i[new edit] do
          member do
            post :audio
            delete :audio, action: :remove_audio
          end
        end
        resources :collections, controller: "learning_collections", except: %i[new edit]
        resources :scenarios, controller: "it_scenarios", except: %i[new edit]
        resources :phrases, controller: "toolkit_phrases", except: %i[new edit] do
          member do
            post :audio
            delete :audio, action: :remove_audio
          end
        end
        resources :listening, controller: "listening_lessons", except: %i[new edit] do
          member do
            post :audio
            delete :audio, action: :remove_audio
          end
        end
      end

      resource :me, only: %i[show update destroy], controller: "me" do
        post :onboarding
        patch :password
        get :export
        post "email/resend", action: :resend_verification
      end
    end
  end
end
