FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN npm config set update-notifier false

FROM base AS deps
COPY package.json package-lock.json ./
# --loglevel=error suppresses deprecation warnings from transitive dev deps
# (glob, inflight via jest; node-domexception via shadcn). These packages
# never reach the runner stage and npm audit reports zero vulnerabilities.
RUN npm ci --loglevel=error --no-fund

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ARG APP_SHA=dev
ENV APP_SHA=${APP_SHA}

RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --no-create-home --shell /sbin/nologin nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const port=process.env.PORT||3000;require('http').get({host:'127.0.0.1',port,path:'/'},(res)=>process.exit(res.statusCode<500?0:1)).on('error',()=>process.exit(1));"

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
