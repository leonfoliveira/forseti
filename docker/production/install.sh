#!/bin/bash

echo "Loading composition images..."

tar_file=$(ls judge-*.tar | head -n 1)
docker load -i "$tar_file"

echo "Pulling language images..."

while IFS='=' read -r variable image_tag; do
  if [ -z "$variable" ] && [ -z "$image_tag" ]; then
    continue
  fi

  echo "Pulling $image_tag..."
  docker pull "$image_tag"

  if [ $? -ne 0 ]; then
    echo "Failed to pull $image_tag"
    exit 1
  fi

done < images.conf

echo "Instalation completed"
