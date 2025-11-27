FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew :api:clean :api:bootJar

# ---- Runner ----

FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

ARG OTEL_JAVA_AGENT_VERSION="2.22.0"
RUN curl -L https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_JAVA_AGENT_VERSION}/opentelemetry-javaagent.jar -o /app/opentelemetry-javaagent.jar

COPY --from=builder /app/api/build/libs/api.jar app.jar
COPY ./entrypoint.sh entrypoint.sh

EXPOSE 8080

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
