# !/bin/bash

docker build -t forseti-api -f ../applications/backend/api.Dockerfile ../applications/backend --no-cache
docker build -t forseti-autojudge -f ../applications/backend/autojudge.Dockerfile ../applications/backend --no-cache
docker build -t forseti-webapp ../applications/webapp --no-cache
docker build -t forseti-autoscaler ../applications/autoscaler --no-cache
(cd ../applications/cli && make build)

cp ../applications/cli/dist/forseti ./production/forseti

mkdir -p ./production/volumes/migrations
cp -r ../applications/backend/common/src/main/resources/migration/* ./production/volumes/migrations/

mkdir -p ./production/sandboxes
cp -r ../applications/backend/autojudge/src/main/resources/sandboxes/* ./production/sandboxes/

docker build -t forseti-sb-cpp17:latest -f ../applications/backend/autojudge/src/main/resources/sandboxes/cpp17.Dockerfile .
docker build -t forseti-sb-java21:latest -f ../applications/backend/autojudge/src/main/resources/sandboxes/java21.Dockerfile .
docker build -t forseti-sb-python312:latest -f ../applications/backend/autojudge/src/main/resources/sandboxes/python312.Dockerfile .