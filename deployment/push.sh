# !/bin/bash

docker tag judge-api:latest leonfoliveira/judge-api:latest
docker tag judge-autojudge:latest leonfoliveira/judge-autojudge:latest
docker tag judge-webapp:latest leonfoliveira/judge-webapp:latest
docker tag judge-autoscaler:latest leonfoliveira/judge-autoscaler:latest

docker push leonfoliveira/judge-api:latest
docker push leonfoliveira/judge-autojudge:latest
docker push leonfoliveira/judge-webapp:latest
docker push leonfoliveira/judge-autoscaler:latest