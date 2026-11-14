# Development image for the Rails API (production Dockerfile comes in M7).
FROM ruby:3.4

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends build-essential libpq-dev libyaml-dev postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /rails
ENV BUNDLE_PATH=/usr/local/bundle

COPY api/Gemfile api/Gemfile.lock* ./
RUN bundle install

EXPOSE 3000
