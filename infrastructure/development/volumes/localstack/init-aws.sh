#!/bin/bash

echo "=== Deploying CloudFormation Stack in LocalStack ==="

awslocal cloudformation create-stack \
  --stack-name forseti-stack \
  --template-body file:///etc/localstack/init/ready.d/template.yaml

awslocal secretsmanager create-secret \
  --name root_password \
  --secret-string forsetijudge

echo "=== CloudFormation Stack Deployment Initiated ==="
