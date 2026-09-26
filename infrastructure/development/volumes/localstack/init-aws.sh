#!/bin/bash
echo "=== Deploying CloudFormation Stack in LocalStack ==="

awslocal cloudformation create-stack \
  --stack-name forseti-stack \
  --template-body file:///etc/localstack/init/ready.d/template.yaml

echo "=== CloudFormation Stack Deployment Initiated ==="