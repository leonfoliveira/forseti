# Architecture

Forseti is designed with a microservices architecture on AWS to ensure scalability, security, and maintainability. The diagram below illustrates the key components and their interactions within the platform.

![Architecture diagram](../img/architecture.jpg)

## Key Components

- **Route53**: AWS Route 53 is used for domain name system (DNS) management, routing user requests to the appropriate CloudFront distribution and ensuring high availability and reliability.
- **CloudFront**: AWS CloudFront is used as a content delivery network (CDN) to distribute the frontend assets globally, ensuring low latency and high availability for users accessing the platform.
- **webapp-bucket**: An S3 bucket that stores the frontend assets for the web application, which are then distributed via CloudFront.
- **core**: The core backend service that handles the main application logic, including contest management, user management, and integration with other microservices. It has a RESTful API for communication with the frontend and other services and a WebSocket interface for real-time updates. Is deployed on ECS Fargate for containerized, serverless operation and has an ALB (Application Load Balancer) for distributing incoming traffic efficiently.
- **core-cache**: A caching layer for the core backend service deployed on AWS ElastiCache with Redis, providing fast access to frequently used data and improving overall system performance. Sessions and leaderboard data are stored here to reduce database load and enhance response times.
- **core-db**: The primary database for the core backend service, deployed on AWS RDS Aurora. It stores all persistent data, including user information, contest details, and submission records, ensuring data durability and consistency.
- **core-bucket**: An S3 bucket used by the core backend service for storing and retrieving files, such as contest problem descriptions, submission code files, and other static assets required by the application.
- **autojudge-submission-queue**: An SQS queue used to manage submission tasks for the autojudge service. When a user submits a solution, a message is placed in this queue, which is then processed by the autojudge workers to execute and evaluate the submissions.
- **core-submission-failed-queue**: An SQS queue used to manage failed submission tasks for the core backend service. When a submission fails during processing, a message is placed in this queue so the core application can update the submission status and take appropriate actions. This queue is a DLQ for `autojudge-submission-queue`.
- **autojudge**: The autojudge service is responsible for executing and evaluating user submissions. It listens to the `autojudge-submission-queue` for new tasks, processes the submissions in isolated environments, and publishes the results to `core-submission-judged-queue`.
- **core-submission-judged-queue**: An SQS queue used to manage successfully judged submission tasks for the core backend service. When the autojudge service completes the evaluation of a submission, a message is placed in this queue so the core application can update the submission status and take appropriate actions.