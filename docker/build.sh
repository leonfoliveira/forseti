# !/bin/bash

# docker build -t judge-api -f ../judge-backend/api.Dockerfile ../judge-backend --no-cache
# docker build -t judge-autojudge -f ../judge-backend/autojudge.Dockerfile ../judge-backend --no-cache
# docker build -t judge-webapp ../judge-webapp --no-cache
# docker build -t judge-autoscaler ../judge-autoscaler --no-cache
# (cd ../judge-cli && make build)

# cp ../judge-cli/dist/judge ./production/judge

mkdir -p ./production/volumes/migrations
cp -r ../judge-backend/common/src/main/resources/migration/* ./production/volumes/migrations/

mkdir -p ./production/sandboxes
cp -r ../judge-backend/autojudge/src/main/resources/sandboxes/* ./production/sandboxes/

docker build -t judge-sb-cpp17:latest -f ../judge-backend/autojudge/src/main/resources/sandboxes/cpp17.Dockerfile .
docker build -t judge-sb-java21:latest -f ../judge-backend/autojudge/src/main/resources/sandboxes/java21.Dockerfile .
docker build -t judge-sb-python312:latest -f ../judge-backend/autojudge/src/main/resources/sandboxes/python312.Dockerfile .