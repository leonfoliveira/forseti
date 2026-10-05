#!/bin/bash
set -e

docker build --no-cache -t forseti-sb-base:latest -f base.Dockerfile .
docker build --no-cache -t forseti-sb-cpp17:latest -f cpp17.Dockerfile .
docker build --no-cache -t forseti-sb-java21:latest -f java21.Dockerfile .
docker build --no-cache -t forseti-sb-node22:latest -f node22.Dockerfile .
docker build --no-cache -t forseti-sb-python312:latest -f python312.Dockerfile .

docker image prune -f
