FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew :worker:clean :worker:bootJar

FROM eclipse-temurin:21-jre AS runner
WORKDIR /app
COPY --from=builder /app/worker/build/libs/judge-worker.jar judge-worker.jar
CMD ["java", "-jar", "judge-worker.jar"]
