# !/bin/bash

docker build -t forseti-api -f ../forseti-backend/api.Dockerfile ../backend --no-cache
docker build -t forseti-autojudge -f ../forseti-backend/autojudge.Dockerfile ../backend --no-cache
docker build -t forseti-webapp ../webapp --no-cache
docker build -t forseti-autoscaler ../autoscaler --no-cache
(cd ../cli && make build)

cp ../cli/dist/forseti ./production/forseti

mkdir -p ./production/volumes/migrations
cp -r ../backend/common/src/main/resources/migration/* ./production/volumes/migrations/

mkdir -p ./production/sandboxes
cp -r ../backend/autojudge/src/main/resources/sandboxes/* ./production/sandboxes/

docker build -t forseti-sb-cpp17:latest -f ../backend/autojudge/src/main/resources/sandboxes/cpp17.Dockerfile .
docker build -t forseti-sb-java21:latest -f ../backend/autojudge/src/main/resources/sandboxes/java21.Dockerfile .
docker build -t forseti-sb-python312:latest -f ../backend/autojudge/src/main/resources/sandboxes/python312.Dockerfile .