# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/dist ./dist
COPY api/my-ip.js ./api/my-ip.js
COPY server.mjs ./server.mjs

EXPOSE 8080
CMD ["node", "server.mjs"]
