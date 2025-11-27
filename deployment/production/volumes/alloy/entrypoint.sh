#!/bin/sh

set -e

# Function to wait for HTTP health endpoint
wait_for_http_health() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-60}
    local attempt=1
    
    echo "Waiting for $service_name at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if wget --spider -q "$url" 2>/dev/null; then
            echo "$service_name is healthy!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: $service_name not healthy yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "ERROR: $service_name at $url is not available after $max_attempts attempts"
    exit 1
}

# Wait for dependent services to be healthy
wait_for_http_health "Loki" "http://loki:3100/ready" 60
wait_for_http_health "Prometheus" "http://prometheus:9090/-/healthy" 60
wait_for_http_health "Tempo" "http://tempo:3200/ready" 60

echo "Starting Alloy..."
exec /usr/bin/alloy run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy
