FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew :autojudge:clean :autojudge:bootJar

# ---- Runner ----

FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates curl

ARG OTEL_JAVA_AGENT_VERSION="2.22.0"
RUN curl -L https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_JAVA_AGENT_VERSION}/opentelemetry-javaagent.jar \
    -O /app/opentelemetry-javaagent.jar

ARG DOCKER_CLI_VERSION=26.1.3
RUN curl -L "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_CLI_VERSION}.tgz" | tar xz \
    && mv docker/docker /usr/local/bin/docker \
    && rm -r docker
ENV DOCKER_HOST=unix:///var/run/docker.sock

COPY --from=builder /app/autojudge/build/libs/autojudge.jar app.jar
COPY ./entrypoint.sh entrypoint.sh

EXPOSE 8081

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
