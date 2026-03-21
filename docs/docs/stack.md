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

### Resources

Each service has configurable resource limits and reservations defined in `stack.conf`. This allows for efficient resource management and ensures that critical services have the necessary resources to operate effectively while preventing any single service from consuming excessive resources. The default values are:

| Service                     | Mode       | CPU Reservation | CPUs     | Memory Reservation | Memory Limit         |
|-----------------------------|------------|:---------------:|:--------:|:------------------:|:--------------------:|
| Alloy                       | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| API                         | replicated | 0.5             | 1.0      | 512M               | 1G                   |
| AutoJudge                   | replicated | 0.5             | 1.0      | 512M               | 1G                   |
| AutoJudge Autoscaler        | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| cAdvisor                    | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| ClamAV                      | global     | 0.5             | 1.0      | 1G                 | 2G                   |
| Grafana                     | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| Loki                        | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| Migration (job)             | replicated | 0.1             | 0.2      | 128M               | 256M                 |
| MinIO                       | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| MinIO Init (job)            | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| Node Exporter               | global     | 0.05            | 0.1      | 64M                | 128M                 |
| PostgreSQL                  | replicated | 0.5             | 1.0      | 512M               | 1G                   |
| PostgreSQL Exporter         | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| Prometheus                  | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| RabbitMQ                    | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| Redis                       | replicated | 0.1             | 0.2      | 128M               | 256M                 |
| Redis Exporter              | replicated | 0.05            | 0.1      | 64M                | 128M                 |
| Tempo                       | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| Traefik                     | replicated | 0.1             | 0.2      | 128M               | 256M                 |
| WebApp                      | replicated | 0.25            | 0.5      | 256M               | 512M                 |
| **Total**                   |            | **4.40**        | **8.80** | **5184M (≈5.06G)** | **10368M (≈10.13G)** |

All replicated services start with 1 replica by default, except for the AutoJudge which is auto scaled based on the submission queue workload from 1 to 3 replicas. Global services run one instance per node in the swarm. These values can be adjusted in `stack.conf` to better fit the expected load and available resources of the deployment environment.

### Scaling

Services can be scaled horizontally by increasing the number of replicas. This allows the system to handle more concurrent users and requests. Use the [CLI](cli.md) to adjust the replica count for these services based on expected load. 

The API and the WebApp are the primary candidates for scaling as they directly handle user interactions and can benefit from load distribution. 

> Some services, such as PostgreSQL and RabbitMQ, are typically not scaled horizontally due to their stateful nature and the complexity of clustering. Instead, they can be optimized through resource allocation and configuration tuning.

#### Scalling the AutoJudge

The AutoJudge service is auto scaled based on the workload of the submission queue. The AutoJudge Autoscaler monitors the queue length and adjusts the number of AutoJudge instances accordingly to ensure timely processing of submissions while optimizing resource usage. There are two parameters that can be configured to control the scaling behavior:

- `autojudge_autoscaler.min_replicas`: The minimum number of AutoJudge instances to maintain, even when the queue is empty. This ensures that there are always some instances available to handle incoming submissions without delay.
- `autojudge_autoscaler.max_replicas`: The maximum number of AutoJudge instances that can be scaled up to handle a surge in submissions. This prevents excessive resource consumption during peak times while still allowing for increased processing capacity when needed.
- `autojudge.max_concurrent_submissions`: The maximum number of submissions that a single AutoJudge instance can process concurrently. This helps to prevent overloading individual instances and ensures that resource limits are respected.

> When setting these parameters, consider the memory limit of the problems and the expected submission rate to ensure fairness between contestants. A node running AutoJudge instances should have at least `max_memory_limit * replicas_in_node * max_concurrent_submissions` of available memory to avoid resource contention and ensure smooth operation.

### Disable Telemetry

Telemetry can be disabled by setting `global.telemetry` to `false` in `stack.conf`. This will remove the services related to observability (Alloy, cAdvisor, Grafana, Loki, Node Exporter, PostgreSQL Exporter, Redis Exporter, Tempo) from the stack. Disabling telemetry can reduce resource usage and simplify the deployment for smaller contests or testing environments where monitoring is not required. However, it also means that you will not have access to performance metrics, logs, or traces for troubleshooting and optimization. Summing the defaults for the observability services yields the approximate resources saved by disabling telemetry:

- **CPU reservation (sum):** 1.00 cores
- **CPU limit (sum):** 2.00 cores
- **Memory reservation (sum):** 1088M (≈1.06 GB)
- **Memory limit (sum):** 2176M (≈2.13 GB)

> These values are the sum of the default reservations/limits for Alloy, cAdvisor, Grafana, Loki, Node Exporter, PostgreSQL Exporter, Redis Exporter and Tempo. Actual savings depend on which observability services are enabled in `stack.conf` and any custom resource values you set.
