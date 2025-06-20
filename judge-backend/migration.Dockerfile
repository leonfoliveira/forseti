FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
CMD ["./gradlew", ":common:flywayMigrate"]
