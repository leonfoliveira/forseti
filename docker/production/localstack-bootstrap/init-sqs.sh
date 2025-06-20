#!/bin/bash

awslocal sqs create-queue --queue-name "submission-dlq"

createQueue() {
    local queue_name="$1"
    local dlq_name="$2"

    awslocal sqs create-queue --queue-name "$queue_name" \
        --attributes "{
            \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\": \\\"arn:aws:sqs:us-east-1:000000000000:$dlq_name\\\", \\\"maxReceiveCount\\\": \\\"3\\\"}\",
            \"VisibilityTimeout\": \"30\"
        }"
}    

createQueue "submission-failed-queue" "submission-dlq"
createQueue "submission-queue" "submission-failed-queue"

exit 0
