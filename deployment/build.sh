# !/bin/bash
set -e

docker buildx build --no-cache -t forseti-api -f ../applications/backend/api.Dockerfile ../applications/backend
docker buildx build --no-cache -t forseti-autojudge -f ../applications/backend/autojudge.Dockerfile ../applications/backend
docker buildx build --no-cache -t forseti-webapp ../applications/webapp
docker buildx build --no-cache -t forseti-autoscaler ../applications/autoscaler

(cd ../applications/cli && make build)
cp ../applications/cli/dist/forseti ./production/forseti

mkdir -p ./production/volumes/migrations
cp -r ../applications/backend/core/src/main/resources/migration/* ./production/volumes/migrations/

mkdir -p ./production/sandboxes
cp -r ../applications/backend/infrastructure/src/main/resources/sandboxes/* ./production/sandboxes/

cd ../applications/backend/infrastructure/src/main/resources/sandboxes
docker buildx build --no-cache -t forseti-sb-base:latest -f base.Dockerfile .
docker buildx build --no-cache -t forseti-sb-cpp17:latest -f cpp17.Dockerfile .
docker buildx build --no-cache -t forseti-sb-java21:latest -f java21.Dockerfile .
docker buildx build --no-cache -t forseti-sb-node22:latest -f node22.Dockerfile .
docker buildx build --no-cache -t forseti-sb-python312:latest -f python312.Dockerfile .

docker image prune -f
cd - > /dev/null