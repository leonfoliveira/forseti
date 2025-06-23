#!/bin/bash

set -e

### Load judge images


echo "Loading tar images..."

tar_file=$(ls judge-*.tar | head -n 1)
docker load -i "$tar_file"


### Pull compose images

echo "Pulling compose images..."

docker compose pull -f stack.yml

### Pull language images


echo "Pulling language images..."

while IFS='=' read -r variable image_tag; do
  docker pull "$image_tag"
done < images.conf


### Finish

echo "Instalation completed"
