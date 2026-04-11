# ── Stage 1: deps ──────────────────────────────────────────────────────────────
# Install only production + dev deps using the lock file.
# This layer is cached as long as package manifests don't change.
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/app/package.json ./packages/app/package.json
COPY apps/next/package.json ./apps/next/package.json

RUN npm ci --prefer-offline

# ── Stage 2: builder ───────────────────────────────────────────────────────────
# Build the Next.js app. NEXT_PUBLIC_* vars are baked into the JS bundle here.
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These build args come from Cloud Build (parsed from the Secret Manager JSON).
# They are baked into the client-side bundle at build time.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GOOGLE_ADSENSE_ID

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GOOGLE_ADSENSE_ID=$NEXT_PUBLIC_GOOGLE_ADSENSE_ID
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=@radio-app/next

# ── Stage 3: runner ────────────────────────────────────────────────────────────
# Minimal production image. Only contains the standalone output.
# start.js reads /run/secrets/app.json (Cloud Run volume) and boots Next.js.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# standalone output replicates the monorepo root structure thanks to
# outputFileTracingRoot: '../../' in next.config.js.
# server.js ends up at apps/next/server.js inside the standalone directory.
COPY --from=builder --chown=nextjs:nodejs /app/apps/next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/next/.next/static ./apps/next/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/next/public ./apps/next/public

# Wrapper script: parses /run/secrets/app.json → process.env → starts Next.js
COPY --chown=nextjs:nodejs start.js ./start.js

USER nextjs
EXPOSE 8080

CMD ["node", "start.js"]
