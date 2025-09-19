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

# Wait for RabbitMQ to be ready
if [ -n "$RABBITMQ_HOST" ] && [ -n "$RABBITMQ_PORT" ]; then
    wait_for_service "$RABBITMQ_HOST" "$RABBITMQ_PORT" "RabbitMQ" 30
fi

# Load secrets into environment variables
if [ -n "$RABBITMQ_PASSWORD_FILE" ]; then
  export RABBITMQ_PASSWORD=$(cat "$RABBITMQ_PASSWORD_FILE")
fi

echo "Starting application..."
exec python -m autoscaler
