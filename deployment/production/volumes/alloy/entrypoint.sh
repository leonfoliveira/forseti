#!/bin/sh
set -e

wait_for_service() {
  local service_name=$1
  local url=$2
  
  echo "Waiting for $service_name to be healthy..."

  max_attempts=60
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if wget --spider -q "$url" 2>/dev/null; then
      echo "$service_name is healthy!"
      break
    fi
    
    echo "$service_name not yet healthy (attempt $((attempt+1))/$max_attempts)"
    attempt=$((attempt+1))
    sleep 2
  done

  if [ $attempt -eq $max_attempts ]; then
    echo "ERROR: Timeout waiting for $service_name to be healthy"
    exit 1
  fi
}

# Wait for dependent services to be healthy
wait_for_service "Loki" "http://loki:3100/ready"
wait_for_service "Prometheus" "http://prometheus:9090/-/healthy"
wait_for_service "Tempo" "http://tempo:3200/ready"

# Start
echo "Starting Loki..."
exec /usr/bin/loki -config.expand-env=true -config.file=/etc/loki/config.yaml
