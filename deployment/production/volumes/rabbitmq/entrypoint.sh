#!/bin/sh

set -e

# Load secrets into environment variables
if [ -n "$RABBITMQ_PASSWORD_FILE" ]; then
    export RABBITMQ_PASSWORD=$(cat "$RABBITMQ_PASSWORD_FILE")
fi

# Process RabbitMQ definitions template
sed -e "s/\$RABBITMQ_USER/$RABBITMQ_USER/" -e "s/\$RABBITMQ_PASSWORD/$RABBITMQ_PASSWORD/" /etc/rabbitmq/definitions.template.json > /etc/rabbitmq/definitions.json

echo "Starting RabbitMQ server..."
exec rabbitmq-server
