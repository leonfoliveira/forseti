#!/bin/sh

set -e

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "Waiting for $service_name with health check at $url..."

    while [ $attempt -le $max_attempts ]; do
        # Use curl to check HTTP status code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
            echo "$service_name is ready! (HTTP $status_code)"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: $service_name not ready yet (HTTP $status_code), waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "ERROR: $service_name at $url is not available after $max_attempts attempts"
    exit 1
}

# Install curl if not available
if ! command -v curl >/dev/null 2>&1; then
    echo "Installing curl..."
    apk add --no-cache curl 2>/dev/null || true
fi

# Wait for API service to be ready
echo "Checking API service availability..."
API_HEALTH_URL="$API_INTERNAL_URL/actuator/health"
wait_for_service "$API_HEALTH_URL" "API Service"

echo "Starting webapp application..."
exec npm run start
