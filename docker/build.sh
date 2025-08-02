#!/bin/sh

if [ -z "$VERSION" ]; then
    VERSION="latest"
fi

IMAGE_FILTER="$1"

build_image() {
    name=$1
    shift
    if [ -z "$IMAGE_FILTER" ] || [ "$IMAGE_FILTER" = "$name" ]; then
        docker build -t "$name:$VERSION" "$@"
    fi
}

build_image "judge-api" -f ../judge-backend/api.Dockerfile ../judge-backend
build_image "judge-autojudge" -f ../judge-backend/autojudge.Dockerfile ../judge-backend
build_image "judge-webapp" ../judge-webapp
build_image "auto-scaler" ../util/auto-scaler
build_image "aws-exporter" ../util/aws-exporter

exit 0