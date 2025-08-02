FROM node:22.16.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM node:22.16.0-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 80
CMD ["npm", "run", "start"]