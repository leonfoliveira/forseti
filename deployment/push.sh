# !/bin/bash
set -e

docker push leonfoliveira/forseti-api:latest
docker push leonfoliveira/forseti-autojudge:latest
docker push leonfoliveira/forseti-webapp:latest
docker push leonfoliveira/forseti-autoscaler:latest