FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "--filter", "@ttv/web", "dev"]
