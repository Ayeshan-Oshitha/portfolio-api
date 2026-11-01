# ---- Build: install everything, generate the Prisma client, compile NestJS ----
FROM node:22-slim AS build
WORKDIR /app

# Match the npm version used locally (older npm 10 crashed on this project's install).
RUN npm install -g npm@12

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# prisma7.config.ts reads DIRECT_URL, but `prisma generate` never connects.
# This placeholder only exists for this one command and isn't saved in the image.
RUN DIRECT_URL="postgresql://build:build@localhost:5432/build" npm run build

# Remove dev tools (Nest CLI, TypeScript, Prisma CLI) to shrink the image.
RUN npm prune --omit=dev

# ---- Run: only what the API needs ----
FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main"]
