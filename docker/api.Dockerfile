# Development image for the Rails API (production Dockerfile comes in M7).
FROM ruby:3.4

# postgresql-client 17 (pg_dump must match the server version for db/structure.sql)
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends build-essential libpq-dev libyaml-dev curl ca-certificates gnupg && \
    install -d /usr/share/postgresql-common/pgdg && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc && \
    echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -qq && apt-get install -y --no-install-recommends postgresql-client-17 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /rails
ENV BUNDLE_PATH=/usr/local/bundle

COPY api/Gemfile api/Gemfile.lock* ./
RUN bundle install

EXPOSE 3000
