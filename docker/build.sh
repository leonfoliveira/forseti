# !/bin/bash

docker build -t judge-api -f ../judge-backend/api.Dockerfile ../judge-backend
docker build -t judge-autojudge -f ../judge-backend/autojudge.Dockerfile ../judge-backend
docker build -t judge-webapp ../judge-webapp
docker build -t judge-autoscaler ../judge-autoscaler
(cd ../judge-cli && make build)

mkdir -p ./production/volumes/migrations
cp -r ../judge-backend/common/src/main/resources/migration/* ./production/volumes/migrations/

mkdir -p ./production/sandboxes
cp -r ../judge-backend/autojudge/src/main/resources/sandboxes/* ./production/sandboxes/

cp ../judge-cli/dist/judge ./production/judge