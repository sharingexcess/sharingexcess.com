# Static Astro site: build with Bun, serve dist with a tiny static server (Railway sets PORT).
FROM oven/bun:slim AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:slim

WORKDIR /app
# Runtime only — not the full app node_modules (keeps image small)
RUN bun add serve@14.2.6

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "exec bun x serve dist -l tcp://0.0.0.0:${PORT:-3000}"]
