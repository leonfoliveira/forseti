#!/bin/bash

dlq="judge-dlq"

awslocal sqs create-queue --queue-name "$dlq" 

queues=(
    submission-queue
)
for queue in "${queues[@]}"; do
    awslocal sqs create-queue \
    --queue-name "$queue" \
    --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:judge-dlq\",\"maxReceiveCount\":\"3\"}"}'
done

exit 0
