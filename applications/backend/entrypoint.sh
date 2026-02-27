#!/bin/sh

set -e

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=${4:-30}
    local attempt=1
    
    echo "Waiting for $service_name at $host:$port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "$service_name is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "ERROR: $service_name at $host:$port is not available after $max_attempts attempts"
    exit 1
}

# Wait for PostgreSQL to be ready
if [ -n "$DB_URL" ]; then
    # jdbc:postgresql://host:port/database
    DB_HOST=$(echo "$DB_URL" | sed 's|jdbc:postgresql://||' | cut -d'/' -f1 | cut -d':' -f1)
    DB_PORT=$(echo "$DB_URL" | sed 's|jdbc:postgresql://||' | cut -d'/' -f1 | cut -d':' -f2)

    wait_for_service "$DB_HOST" "$DB_PORT" "PostgreSQL" 60
fi

# Wait for Redis to be ready
if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
    wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis" 30
fi

# Wait for Minio to be ready
if [ -n "$MINIO_ENDPOINT" ]; then
    # http://host:port
    MINIO_HOST=$(echo "$MINIO_ENDPOINT" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f1)
    MINIO_PORT=$(echo "$MINIO_ENDPOINT" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f2)

    wait_for_service "$MINIO_HOST" "$MINIO_PORT" "Minio" 30
fi

# Wait for RabbitMQ to be ready
if [ -n "$RABBITMQ_HOST" ] && [ -n "$RABBITMQ_PORT" ]; then
    wait_for_service "$RABBITMQ_HOST" "$RABBITMQ_PORT" "RabbitMQ" 30
fi

# Wait for Alloy to be ready
if [ -n "$OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" ]; then
    # http://host:port
    ALLOY_HOST=$(echo "$OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f1)
    ALLOY_PORT=$(echo "$OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f2)

    wait_for_service "$ALLOY_HOST" "$ALLOY_PORT" "Alloy" 30
fi

# Load secrets into environment variables
if [ -n "$DB_PASSWORD_FILE" ]; then
    export DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
fi

if [ -n "$REDIS_PASSWORD_FILE" ]; then
    export REDIS_PASSWORD=$(cat "$REDIS_PASSWORD_FILE")
fi

if [ -n "$MINIO_SECRET_KEY_FILE" ]; then
    export MINIO_SECRET_KEY=$(cat "$MINIO_SECRET_KEY_FILE")
fi

if [ -n "$RABBITMQ_PASSWORD_FILE" ]; then
    export RABBITMQ_PASSWORD=$(cat "$RABBITMQ_PASSWORD_FILE")
fi

if [ -n "$ROOT_PASSWORD_FILE" ]; then
    export ROOT_PASSWORD=$(cat "$ROOT_PASSWORD_FILE")
fi

echo "Starting backend application..."
exec java -javaagent:opentelemetry-javaagent.jar -jar app.jar