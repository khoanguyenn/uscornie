FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

USER bun
EXPOSE 5173

CMD ["bun", "run", "dev"]
