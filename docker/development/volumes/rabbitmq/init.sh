#!/bin/bash

if [ -n "$RABBITMQ_PASSWORD_FILE" ]; then
  export RABBITMQ_PASSWORD=$(cat "$RABBITMQ_PASSWORD_FILE")
fi

sed -i \
  -e "s/\$RABBITMQ_USER/$RABBITMQ_USER/" \
  -e "s/\$RABBITMQ_PASSWORD/$RABBITMQ_PASSWORD/" \
  /etc/rabbitmq/definitions.json

exec rabbitmq-server
