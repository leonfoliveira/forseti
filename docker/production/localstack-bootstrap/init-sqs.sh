#!/bin/bash

queues=(
    submission-queue
)
for queue in "${queues[@]}"; do
    awslocal sqs create-queue \
    --queue-name "$queue-dlq"

    aws sqs create-queue \
    --queue-name "$queue" \
    --attributes "$(sed "s/{queue-dlq}/$queue/g" /etc/localstack/init/ready.d/sqs-attributes.json)"
done

exit 0
