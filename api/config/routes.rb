Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      post "auth/refresh", to: "auth#refresh"
      delete "auth/logout", to: "auth#logout"

      resources :categories, only: :index
      resources :words, only: %i[index show]
      resources :collections, only: %i[index show]
      get "favorites", to: "favorites#index"
      post "favorites", to: "favorites#create"
      delete "favorites/:type/:id", to: "favorites#destroy"

      get "dashboard", to: "dashboard#show"
      get "progress", to: "progress#show"
      get "history", to: "progress#history"
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
        resources :categories, controller: "vocabulary_categories", except: %i[new edit]
        resources :words, controller: "vocabulary_words", except: %i[new edit] do
          member do
            post :audio
            delete :audio, action: :remove_audio
          end
        end
        resources :collections, controller: "learning_collections", except: %i[new edit]
        resources :scenarios, controller: "it_scenarios", except: %i[new edit]
        resources :listening, controller: "listening_lessons", except: %i[new edit] do
          member do
            post :audio
            delete :audio, action: :remove_audio
          end
        end
      end

      resource :me, only: %i[show update], controller: "me" do
        post :onboarding
      end
    end
  end
end
