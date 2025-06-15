# Judge 

![GitHub release (latest by date)](https://img.shields.io/github/v/release/leonfoliveira/judge)

A fullstack application for running programming contests

## Production

### Requirements

- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)
- [wsl](https://learn.microsoft.com/en-us/windows/wsl/install) (only windows)

### Installation

1. Download the latest [release](https://github.com/leonfoliveira/judge/releases).
2. Unzip it
3. Run `install.sh`

### Running

1. Set environment variables

#### Environment Variables

| **Variable** | **Default** | **Description** |
|---|---|---|
| DB_URL | jdbc:postgresql://postgres:5432/judge | Postgres DB JDBC url |
| DB_USER | | Postgres DB user |
| DB_PASSWORD | | Postgres DB password |
| DB_NAME | judge | Postgres DB name |
| AWS_REGION | us-east-1 | AWS region |
| AWS_ENDPOINT | http://localstack:4566 | AWS endpoint |
| AWS_ACCESS_KEY_ID | judge | AWS access key id |
| AWS_SECRET_ACCESS_KEY | judge | AWS secret access key |
| AWS_S3_BUCKET | judge | AWS bucket name |
| AWS_SQS_LISTENER_CONCURRENCY | 4 | Number of threads per worker |
| AWS_SQS_SUBMISSION_QUEUE | judge-submission-queue | Queue of submissions to be judged |
| AWS_SQS_SUBMISSION_FAILED_QUEUE | judge-submission-failed-queue | DLQ of AWS_SQS_SUBMISSION_QUEUE |
| API_URL | http://api:80 | API url for workers |
| ALLOWED_ORIGINS | | Webapp address |
| JWT_SECRET | | JWT encryption key |
| JWT_EXPIRATION | 21600 | Time in seconds for a member token to expire |
| JWT_ROOT_EXPIRATION | 10800 | Time in seconds for a root token to expire |
| ROOT_PASSWORD | | Root member password |
| NEXT_PUBLIC_API_URL | | API url |

2. Start services
```
docker compose up -d
```

## Pages

| **Page** | **Description** |
|---|---|
| /root | Root dashboard |
| /contests/{id} | Contest dashboard |