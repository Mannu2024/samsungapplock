FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile
EXPOSE 4000
CMD ["pnpm", "--filter", "@ttv/api", "dev"]
