#!/bin/bash

set -eu

echo "=== Deploying CloudFormation Stack in Floci ==="

STACK_NAME="dev-forseti-stack"
REGION="us-east-1"
TEMPLATE="/etc/floci/cloudformation/template.yaml"
ENDPOINT="http://localhost:4566"

if aws --endpoint-url="$ENDPOINT" \
    cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" >/dev/null 2>&1; then

    echo "Stack already exists. Updating..."

    aws --endpoint-url="$ENDPOINT" \
        cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE" \
        --region "$REGION" || {
            echo "No updates required or update failed."
        }
else
    aws --endpoint-url="$ENDPOINT" \
        cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE" \
        --region "$REGION"
fi

echo "=== CloudFormation Stack Deployment Initiated ==="
