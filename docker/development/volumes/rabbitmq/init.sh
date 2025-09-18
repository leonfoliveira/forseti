#!/bin/bash

apk add --no-cache gettext

if [ -n "$RABBITMQ_PASSWORD_FILE" ]; then
  export RABBITMQ_PASSWORD=$(cat "$RABBITMQ_PASSWORD_FILE")
fi

envsubst < /etc/rabbitmq/definitions.template.json > /etc/rabbitmq/definitions.json

cat /etc/rabbitmq/definitions.json

exec rabbitmq-server
