# Production image for the Rails API (also runs Sidekiq with a different command).
# Build from the repository root: docker build -f docker/api.prod.Dockerfile -t english-for-it-api .
FROM ruby:3.4-slim AS build
RUN apt-get update -qq && apt-get install -y --no-install-recommends build-essential libpq-dev libyaml-dev git && rm -rf /var/lib/apt/lists/*
WORKDIR /rails
ENV RAILS_ENV=production BUNDLE_DEPLOYMENT=1 BUNDLE_WITHOUT="development:test"
COPY api/Gemfile api/Gemfile.lock ./
RUN bundle install && rm -rf ~/.bundle "${BUNDLE_PATH:-/usr/local/bundle}"/ruby/*/cache
COPY api/ ./
RUN bundle exec bootsnap precompile app/ lib/

FROM ruby:3.4-slim
# psql 17 is required by db:prepare to load db/structure.sql; libpq for the pg gem
RUN apt-get update -qq && apt-get install -y --no-install-recommends libpq5 libyaml-0-2 curl ca-certificates gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update -qq && apt-get install -y --no-install-recommends postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash rails
WORKDIR /rails
ENV RAILS_ENV=production BUNDLE_DEPLOYMENT=1 BUNDLE_WITHOUT="development:test" RAILS_LOG_TO_STDOUT=1
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build --chown=rails:rails /rails /rails
USER rails
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -fsS http://localhost:3000/up || exit 1
# SECRET_KEY_BASE, DATABASE_URL, REDIS_URL, ALLOWED_HOSTS, CORS_ORIGINS, API_PUBLIC_URL are provided at runtime.
CMD ["bash", "-c", "bin/rails db:prepare && bundle exec puma -C config/puma.rb"]
