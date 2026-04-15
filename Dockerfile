# ── Stage 1: Build React app ─────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install
COPY . .
RUN npm run build

# ── Stage 2: Serve (nginx + Node session API) ─────────────────
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copy built static files for nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy server and its dependencies
COPY --from=build /app/node_modules ./node_modules
COPY server.js ./
COPY package.json ./

# Nginx config with /api proxy
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

# Start Node API server (port 3001) then nginx in foreground
CMD sh -c "node server.js & nginx -g 'daemon off;'"
