# Development image for the Next.js app.
FROM node:22

WORKDIR /app

COPY web/package.json web/package-lock.json* ./
RUN npm install

EXPOSE 3000
