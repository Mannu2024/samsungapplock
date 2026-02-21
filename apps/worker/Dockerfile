FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile
CMD ["pnpm", "--filter", "@ttv/worker", "dev"]
