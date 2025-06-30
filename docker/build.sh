#!/bin/sh

if [ -z "$VERSION" ]; then
    VERSION="latest"
fi

docker build -t "judge-api:$VERSION" -f ../judge-backend/api.Dockerfile ../judge-backend
docker build -t "judge-worker:$VERSION" -f ../judge-backend/worker.Dockerfile ../judge-backend
docker build -t "judge-webapp:$VERSION" ../judge-webapp
docker build -t "auto-scaler:$VERSION" ../util/auto-scaler
docker build -t "aws-exporter:$VERSION" ../util/aws-exporter

exit 0