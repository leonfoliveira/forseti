#!/bin/bash

bucket="judge"

awslocal s3 mb s3://$bucket

cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

awslocal s3api put-bucket-cors \
  --bucket $bucket \
  --cors-configuration file:///tmp/cors.json

exit 0
