FROM node:22.16.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ---- Runner ----

FROM node:22.16.0-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY entrypoint.sh entrypoint.sh

EXPOSE 3000

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]