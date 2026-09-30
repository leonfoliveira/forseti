#!/bin/sh

set -e

# Check Docker socket availability
if [ -S "/var/run/docker.sock" ]; then
    echo "Docker socket is available"
else
    echo "WARNING: Docker socket not found at /var/run/docker.sock"
fi

echo "Starting judge worker..."
exec python -m judge