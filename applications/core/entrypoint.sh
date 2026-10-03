#!/bin/sh

set -e

SECRET_FILES=(
    "AWS_ACCESS_KEY_FILE"
    "AWS_SECRET_KEY_FILE"
    "DB_PASSWORD_FILE"
    "REDIS_PASSWORD_FILE"
)

for secret_file in "${SECRET_FILES[@]}"; do
    if [ -n "${!secret_file}" ]; then
        export "${secret_file%_FILE}=$(cat "${!secret_file}")"
    fi
done

echo "Starting application..."
exec java -javaagent:opentelemetry-javaagent.jar -jar app.jar
