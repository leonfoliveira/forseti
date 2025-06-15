#!/bin/bash

awslocal sqs create-queue --queue-name "judge-submission-dlq"

createQueue() {
    local queue_name="$1"
    local dlq_name="$2"

    awslocal sqs create-queue --queue-name "$queue_name" \
        --attributes "{
            \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\": \\\"arn:aws:sqs:us-east-1:000000000000:$dlq_name\\\", \\\"maxReceiveCount\\\": \\\"3\\\"}\",
            \"VisibilityTimeout\": \"30\"
        }"
}    

createQueue "judge-submission-failed-queue" "judge-submission-dlq"
createQueue "judge-submission-queue" "judge-submission-failed-queue"

exit 0
