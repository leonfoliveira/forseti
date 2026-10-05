# ---- Builder ----
FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run build

# ---- Runner ----

FROM nginx:alpine AS runner

RUN apk add --no-cache curl

COPY --from=builder /app/out /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
