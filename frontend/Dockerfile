# Development image for the React dev server (hot module replacement).
# Build context is frontend/ (see docker-compose frontend service).
FROM node:20-alpine AS frontend-dev

WORKDIR /app

# Pre-install dependencies; source is mounted at runtime for hot reload.
COPY package.json ./
RUN npm install --no-audit --no-fund

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
