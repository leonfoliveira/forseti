FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew :api:clean :api:bootJar

# ---- Runner ----

FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/api/build/libs/api.jar app.jar
COPY --from=builder /app/opentelemetry-javaagent.jar opentelemetry-javaagent.jar
COPY ./entrypoint.sh entrypoint.sh

EXPOSE 8080
EXPOSE 8081

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
