# Static Astro site: build legacy app with Bun, serve dist with a tiny static server (Railway sets PORT).
# At cutover: change build step to `cd web && bun run build` and COPY web/dist.
FROM oven/bun:slim AS builder

WORKDIR /app

COPY legacy/package.json legacy/bun.lock ./legacy/
RUN cd legacy && bun install --frozen-lockfile

COPY legacy/ ./legacy/
COPY public/ ./public/
RUN cd legacy && bun run build

FROM oven/bun:slim

WORKDIR /app
RUN bun add serve@14.2.6

COPY --from=builder /app/legacy/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "exec bun x serve dist -l tcp://0.0.0.0:${PORT:-3000}"]
