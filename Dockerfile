FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS build
COPY package.json bun.lock ./
COPY client/package.json client/bun.lock ./client/
RUN bun install 
WORKDIR /app/client
RUN bun install
WORKDIR /app
COPY . .
RUN bun run build

FROM oven/bun:latest AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client
COPY package.json bun.lock ./
RUN bun install --production

EXPOSE 3000
CMD ["bun", "run", "start"]