# !/bin/bash

docker tag forseti-api:latest leonfoliveira/forseti-api:latest
docker tag forseti-autojudge:latest leonfoliveira/forseti-autojudge:latest
docker tag forseti-webapp:latest leonfoliveira/forseti-webapp:latest
docker tag forseti-autoscaler:latest leonfoliveira/forseti-autoscaler:latest

docker push leonfoliveira/forseti-api:latest
docker push leonfoliveira/forseti-autojudge:latest
docker push leonfoliveira/forseti-webapp:latest
docker push leonfoliveira/forseti-autoscaler:latest