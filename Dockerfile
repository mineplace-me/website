# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine AS base
WORKDIR /app

RUN apk add wget

COPY . .

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN bun install --frozen-lockfile

RUN bun run build

# run the app
CMD [ "bun", "serve" ]