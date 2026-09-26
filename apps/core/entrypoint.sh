#!/bin/sh

set -e

# Load secrets into environment variables
if [ -n "$DB_PASSWORD_FILE" ]; then
    export DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
fi

if [ -n "$REDIS_PASSWORD_FILE" ]; then
    export REDIS_PASSWORD=$(cat "$REDIS_PASSWORD_FILE")
fi

echo "Starting application..."
exec java -javaagent:opentelemetry-javaagent.jar -jar app.jar
