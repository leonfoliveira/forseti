#!/bin/sh
set -e

# Load secrets
export MINIO_SECRET_KEY=$(cat /run/secrets/minio_password)

# Wait for MinIO to be healthy
echo "Waiting for MinIO to be healthy..."

max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if wget --spider -q http://minio:9000/minio/health/live 2>/dev/null; then
    echo "MinIO is healthy!"
    break
  fi
  
  echo "MinIO not yet healthy (attempt $((attempt+1))/$max_attempts)"
  attempt=$((attempt+1))
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "ERROR: Timeout waiting for MinIO to be healthy"
  exit 1
fi

# Start
echo "Starting Tempo..."
exec /tempo -config.expand-env=true -config.file=/etc/tempo/config.yaml
