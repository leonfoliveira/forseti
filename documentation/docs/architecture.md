# Architecture Overview

Forseti is designed with a microservices architecture on AWS to ensure scalability, security, and maintainability. The diagram below illustrates the key components and their interactions within the platform.

![Architecture diagram](../img/architecture.jpg)

## Key Components

### Network

- **Route53**: AWS Route 53 is used for domain name system (DNS) management, routing user requests to the appropriate CloudFront distribution and ensuring high availability and reliability.
- **CloudFront**: AWS CloudFront is used as a content delivery network (CDN) in front of both the frontend (assets served from a private S3 bucket) and the core API. For the API nothing is cached: CloudFront terminates TLS close to the users and reuses connections to the origin. The load balancer only accepts HTTPS requests that come through CloudFront.
- **VPC**: Two availability zones with public and private subnets. The load balancer and the EC2 instances run in the public subnets (inbound access is restricted by security groups and there is no NAT gateway, to keep costs low), while the database and the cache run in private subnets without internet access.

### Computing

- **core**: The core backend service that handles the main application logic, including contest management, user management, and integration with other microservices. It has a RESTful API for communication with the frontend and other services and Server-Sent Events (SSE) for real-time updates, fanned out between instances through Redis pub/sub. It runs on Amazon ECS with the EC2 launch type behind an ALB (Application Load Balancer) that distributes incoming traffic across availability zones.
- **autojudge**: The autojudge service is responsible for executing and evaluating user submissions. It listens to the `autojudge-submission-queue` for new tasks, processes the submissions in isolated Docker containers, and publishes the results to `core-submission-judged-queue`. It runs on its own EC2 fleet, separate from core, because it needs access to the Docker daemon and executes untrusted code. The fleet scales with the number of waiting submissions and scales to zero when no contest is running.

### Storage

- **webapp-bucket**: An S3 bucket that stores the frontend assets for the web application, which are then distributed via CloudFront.
- **core-bucket**: An S3 bucket used by the core backend service for storing and retrieving files, such as contest problem descriptions, submission code files, and other static assets required by the application. Browsers upload and download these files directly through signed URLs.
- **core-cache**: A caching layer for the core backend service deployed on AWS ElastiCache with Valkey (Redis-compatible), providing fast access to frequently used data and improving overall system performance. Sessions, leaderboard data and recent SSE messages are stored here to reduce database load and enhance response times.
- **core-db**: The primary database for the core backend service, deployed on AWS RDS for PostgreSQL. It stores all persistent data, including user information, contest details, and submission records, ensuring data durability and consistency.

### Messaging

- **autojudge-submission-queue**: An SQS queue used to manage submission tasks for the autojudge service. When a user submits a solution, a message is placed in this queue, which is then processed by the autojudge workers to execute and evaluate the submissions.
- **core-submission-failed-queue**: An SQS queue used to manage failed submission tasks for the core backend service. When a submission fails during processing, a message is placed in this queue so the core application can update the submission status and take appropriate actions. This queue is a DLQ for `autojudge-submission-queue`.
- **core-submission-judged-queue**: An SQS queue used to manage successfully judged submission tasks for the core backend service. When the autojudge service completes the evaluation of a submission, a message is placed in this queue so the core application can update the submission status and take appropriate actions.
- **core-auto-freeze-queue**: An SQS queue that receives the messages sent by Amazon EventBridge Scheduler at the time a contest has to be frozen automatically. The schedules are created and cancelled by the core application.

## Operating Modes

The infrastructure has two operating modes, so the system is cheap while idle and highly available while a contest is running:

- **idle**: A single availability zone with the smallest instances and no autojudge instances. Availability and latency are not a priority, and the monthly cost is minimal.
- **contest**: Core, the autojudge fleet, the database and the cache run in two availability zones with automatic failover, and the autojudge fleet keeps at least two instances ready and grows with the submission backlog.

The mode is a parameter of the CloudFormation stacks and is switched before and after each contest. See `infrastructure/production/README.md` in the repository for the stack layout and the operating procedures.