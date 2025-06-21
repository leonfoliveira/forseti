FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew :api:clean :api:bootJar

FROM eclipse-temurin:21-jre AS runner
WORKDIR /app
EXPOSE 8080
COPY --from=builder /app/api/build/libs/judge-api.jar judge-api.jar
CMD ["java", "-jar", "judge-api.jar"]
