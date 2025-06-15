FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar

FROM eclipse-temurin:21-jre AS runner
WORKDIR /app
EXPOSE 80
COPY --from=builder /app/build/libs/judge-api.jar judge-api.jar
CMD ["java", "-jar", "judge-api.jar"]
