# Stack

The system stack is deployed using Docker Swarm, which allows for easy management and scaling of services. The stack includes all necessary components such as the API server, AutoJudge, database and observability tools. Use the CLI commands to manage the stack lifecycle, including deployment, scaling, and removal.

## Services

**- Alloy:** Observability agent that collects telemetry data (metrics, logs, traces) from services and forwards them to the monitoring stack. Acts as the central collection point for all observability data.

**- API:** Main backend service built with Spring Boot that provides the REST API for contest management, user authentication, submission handling, and all core business logic. Exposes both HTTP and WebSocket endpoints.

**- AutoJudge:** Service responsible for securely executing and evaluating code submissions in isolated Docker containers. Supports multiple programming languages and enforces resource limits.

**- AutoJudge Autoscaler:** Monitors the submission queue and automatically scales AutoJudge instances up or down based on workload. Ensures optimal resource utilization and response times.

**- cAdvisor:** Container advisor that collects resource usage and performance metrics from all Docker containers running on each node. Provides detailed container-level monitoring data.

**- ClamAV:** Antivirus service that scans attachments for malware and viruses before they are uploaded to MinIO. Ensures the security of stored files and prevents malicious content from being processed by the system.

**- Grafana:** Visualization platform that provides dashboards and alerting for system monitoring. Displays metrics, logs, and traces collected from the entire stack in an intuitive web interface.

**- Loki:** Log aggregation system that collects, stores, and indexes logs from all services. Provides efficient log querying and integrates seamlessly with Grafana for log visualization.

**- MinIO:** S3-compatible object storage service that stores test case files, submission artifacts, and other binary data. Provides scalable and reliable file storage for the platform.

**- Node Exporter:** System metrics collector that gathers hardware and OS-level metrics from each Docker Swarm node. Provides insights into CPU, memory, disk, and network usage.

**- PostgreSQL:** Primary relational database that stores all structured data including users, contests, problems, submissions, and audit trails. Configured with performance optimizations for high throughput.

**- PostgreSQL Exporter:** Metrics collector specifically for PostgreSQL that exports database performance metrics, query statistics, and health information to Prometheus.

**- Prometheus:** Time-series database that collects and stores metrics from all services and exporters. Provides the foundation for monitoring, alerting, and historical data analysis.

**- RabbitMQ:** Message queue service that handles asynchronous communication between services. Manages submission queues, WebSocket events, and ensures reliable message delivery with persistence.

**- Redis:** In-memory data store used for session management, caching, and temporary data storage. Provides fast access to frequently used data and user session information.

**- Redis Exporter:** Metrics collector for Redis that monitors cache performance, memory usage, and connection statistics. Helps optimize Redis configuration and troubleshoot issues.

**- Tempo:** Distributed tracing backend that collects and stores trace data from all services. Enables request flow analysis and performance debugging across the microservices architecture.

**- Traefik:** Reverse proxy and load balancer that handles all incoming traffic routing, SSL termination, and rate limiting. Automatically discovers services and configures routing rules.

**- WebApp:** Frontend Next.js application that provides the user interface for contestants and administrators. Serves the web-based interface for contest participation and system management.

## Jobs

**- Migration:** Database migration job that applies schema changes and data migrations using Flyway. Ensures the PostgreSQL database stays up-to-date with the application requirements.

**- MinIO Init:** Initialization job that creates the necessary storage buckets in MinIO during deployment. Ensures proper object storage setup before other services start.

## Deployment

The deployment is managed through the Forseti CLI, which provides commands to install dependencies, deploy the stack, and manage its lifecycle. The stack is defined using a Docker Swarm template (`stack.yaml.j2`) that is rendered with parameters from `stack.conf`. This allows for flexible configuration of service replicas, resource limits, and other settings.

Once deployed, public services are acessible through:

- `http[s]://<domain>/{contestId}`: Web application for a Forseti contest.
- `http[s]://api.<domain>`: API endpoints routing to the API service.
- `http[s]://grafana.<domain>`: Grafana dashboards for monitoring and observability.
- `http[s]://alloy.<domain>/collect`: Endpoint for Alloy to receive telemetry data from services.
- `postgresql://postgres.<domain>:5432`: PostgreSQL database connection.
