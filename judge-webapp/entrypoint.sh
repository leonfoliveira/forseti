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

# Wait for API to be ready
if [ -n "$API_INTERNAL_URL" ]; then
    # http://host:port
    API_HOST=$(echo "$API_INTERNAL_URL" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f1)
    API_PORT=$(echo "$API_INTERNAL_URL" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f2)

    wait_for_service "$API_HOST" "$API_PORT" "API" 30
fi

echo "Starting webapp application..."
exec npm run start
