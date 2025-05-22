#!/bin/bash

bucket="judge"

awslocal s3 mb s3://$bucket

awslocal s3api put-bucket-cors \
  --bucket "$bucket" \
  --cors-configuration file:///etc/localstack/init/ready.d/cors-config.json

exit 0