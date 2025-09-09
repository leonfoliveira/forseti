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

# Install netcat if not available (for health checks)
if ! command -v nc >/dev/null 2>&1; then
    echo "Installing netcat..."
    apk add --no-cache netcat-openbsd 2>/dev/null || true
fi

# Wait for LocalStack to be ready (if AWS services are configured)
if [ -n "$AWS_ENDPOINT" ]; then
    # Extract host and port from AWS endpoint
    # Format: http://host:port
    AWS_HOST=$(echo "$AWS_ENDPOINT" | sed 's|http://||' | cut -d':' -f1)
    AWS_PORT=$(echo "$AWS_ENDPOINT" | sed 's|http://||' | cut -d':' -f2)
    
    wait_for_service "$AWS_HOST" "$AWS_PORT" "LocalStack" 30
fi

echo "Starting autoscaler application..."
exec python -m autoscaler
