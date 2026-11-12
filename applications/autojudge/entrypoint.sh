#!/bin/sh

set -e

if [ -S "/var/run/docker.sock" ]; then
    echo "Docker socket is available"
else
    echo "WARNING: Docker socket not found at /var/run/docker.sock"
fi

echo "Starting autojudge workers..."
exec gunicorn -c gunicorn.conf.py autojudge.api:app
