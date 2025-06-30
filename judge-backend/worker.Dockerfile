FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew :worker:clean :worker:bootJar

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app
RUN apk add --no-cache ca-certificates curl
ARG DOCKER_CLI_VERSION=26.1.3
RUN curl -L "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_CLI_VERSION}.tgz" | tar xz \
    && mv docker/docker /usr/local/bin/docker \
    && rm -r docker
ENV DOCKER_HOST=unix:///var/run/docker.sock
COPY --from=builder /app/worker/build/libs/judge-worker.jar app.jar
COPY ./entrypoint.sh entrypoint.sh
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
