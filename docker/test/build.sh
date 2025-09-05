#!/bin/sh

docker build -t judge-api:latest -f ../../judge-backend/api.Dockerfile ../../judge-backend
docker build -t judge-autojudge:latest -f ../../judge-backend/autojudge.Dockerfile ../../judge-backend
docker build -t judge-webapp:latest ../../judge-webapp
docker build -t judge-autoscaler:latest ../../judge-autoscaler

exit 0