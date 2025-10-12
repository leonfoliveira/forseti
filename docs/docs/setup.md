# Setup

This guide covers the operational aspects of the Judge platform, including resource configuration, service scaling, and system administration tasks.

## Security Architecture

The Judge platform is designed to run in a **closed environment without internet access** for maximum security during contests. This isolation ensures:

- No external network access for submitted code
- Protection against data exfiltration attempts
- Prevention of external resource access during evaluation
- Secure contest environment with controlled network boundaries

**Encryption:**

All communication between clients and the platform is encrypted using **HTTPS with self-signed TLS certificates** generated during installation. This ensures data confidentiality and integrity within the local network, protecting sensitive contest data and user credentials from interception.

> **Important:** While the system runs in an isolated environment, the **initial installation requires internet access** to pull the necessary Docker images and dependencies. Plan your setup accordingly by completing the installation process before disconnecting from the internet or moving to the isolated network.

## Resource Constraints

Configure resource constraints in `stack.yaml` according to your contest scale and available infrastructure. These settings ensure proper resource allocation and prevent any single service from consuming excessive resources.

### Default Resource Allocation

| **service**          | **deploy mode** | **replicas** | **reserved cpu** | **reserved memory** | **limit cpu** | **limit memory** |
| -------------------- | --------------- | ------------ | ---------------- | ------------------- | ------------- | ---------------- |
| alloy                | global          | -            | 0.1              | 128M                | 0.2           | 256M             |
| api                  | replicated      | 1            | 1                | 512M                | 2             | 1024M            |
| autojudge            | replicated      | 1-3\*        | 1                | 512M                | 2             | 1024M            |
| autojudge-autoscaler | replicated      | 1            | 0.1              | 64M                 | 0.2           | 128M             |
| cadvisor             | global          | -            | 0.1              | 128M                | 0.2           | 256M             |
| grafana              | replicated      | 1            | 0.25             | 128M                | 0.5           | 256M             |
| loki                 | replicated      | 1            | 0.25             | 256M                | 0.5           | 512M             |
| migration            | replicated      | 1            | 0.5              | 256M                | 0.5           | 256M             |
| minio                | replicated      | 1            | 0.25             | 128M                | 0.5           | 256M             |
| node-exporter        | global          | -            | 0.1              | 64M                 | 0.2           | 128M             |
| postgres             | replicated      | 1            | 0.5              | 256M                | 1             | 512M             |
| postgres-exporter    | replicated      | 1            | 0.1              | 64M                 | 0.2           | 128M             |
| prometheus           | replicated      | 1            | 0.25             | 256M                | 0.5           | 512M             |
| rabbitmq             | replicated      | 1            | 0.25             | 256M                | 0.5           | 512M             |
| traefik              | replicated      | 1            | 0.25             | 128M                | 0.5           | 256M             |
| webapp               | replicated      | 1            | 1                | 256M                | 2             | 512M             |

\* Auto-scaled by `autojudge-autoscaler` service. See environment variables to customize scaling behavior.

### Resource Planning Guidelines

**Small Contests (< 100 participants):**

- Use default values
- Single replica for most services
- Minimum 4 CPU cores, 8GB RAM recommended

**Medium Contests (100-500 participants):**

- Scale `api` to 2-3 replicas
- Increase `autojudge` max replicas to 5
- Increase PostgreSQL and RabbitMQ memory limits
- Minimum 8 CPU cores, 16GB RAM recommended

**Large Contests (> 500 participants):**

- Scale `api` and `webapp` to 3+ replicas
- Set `autojudge` max replicas to 10+
- Consider dedicated nodes for database services
- Minimum 16 CPU cores, 32GB RAM recommended

> **Note:** Services with `global` deploy mode run one instance per node in the swarm. Services with `replicated` mode can have multiple instances distributed across nodes.

## Environment Variables

Configure environment variables in `stack.yaml` to customize service behavior. Variables marked with `_FILE` suffix expect a path to a Docker secret file.

### Service Configuration

| **service**              | **variable**                       | **default**                                                                         | **description**                                       |
| ------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **api**                  | COOKIE_DOMAIN                      | .forseti.live                                                                       | Domain of the session_id cookie                       |
|                          | DB_PASSWORD_FILE                   | /run/secrets/db_password                                                            | File containing the database password                 |
|                          | DB_URL                             | jdbc:postgresql://postgres:5432/forseti                                             | JDBC URL for PostgreSQL database connection           |
|                          | DB_USER                            | forseti                                                                             | Database username                                     |
|                          | JAVA_TOOL_OPTIONS                  | "-XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:MinRAMPercentage=25.0" | JVM memory settings (min and max heap size)           |
|                          | SESSION_EXPIRATION                 | 6h                                                                                  | Session expiration time for regular users             |
|                          | SESSION_ROOT_EXPIRATION            | 3h                                                                                  | Session expiration time for root user                 |
|                          | MINIO_ENDPOINT                     | http://minio:9000                                                                   | MinIO S3-compatible storage endpoint                  |
|                          | MINIO_ACCESS_KEY                   | forseti                                                                             | MinIO access key/username                             |
|                          | MINIO_SECRET_KEY_FILE              | /run/secrets/minio_password                                                         | File containing MinIO secret key                      |
|                          | MINIO_BUCKET                       | forseti                                                                             | MinIO bucket name for storing files                   |
|                          | RABBITMQ_HOST                      | rabbitmq                                                                            | RabbitMQ hostname                                     |
|                          | RABBITMQ_PORT                      | 5672                                                                                | RabbitMQ AMQP port                                    |
|                          | RABBITMQ_USER                      | forseti                                                                             | RabbitMQ username                                     |
|                          | RABBITMQ_PASSWORD_FILE             | /run/secrets/rabbitmq_password                                                      | File containing RabbitMQ password                     |
|                          | RABBITMQ_VHOST                     | /                                                                                   | RabbitMQ virtual host                                 |
|                          | RABBITMQ_SUBMISSION_QUEUE          | submission-queue                                                                    | Queue name for submissions                            |
|                          | RABBITMQ_SUBMISSION_EXCHANGE       | submission-exchange                                                                 | Exchange name for submissions                         |
|                          | RABBITMQ_SUBMISSION_ROUTING_KEY    | submission-routing-key                                                              | Routing key for submissions                           |
|                          | RABBITMQ_SUBMISSION_FAILED_QUEUE   | submission-failed-queue                                                             | Queue name for failed submissions                     |
|                          | ROOT_PASSWORD_FILE                 | /run/secrets/root_password                                                          | File containing root user password                    |
|                          | WEBAPP_PUBLIC_URL                  | https://forseti.live                                                                | Public URL of the web application                     |
| **autojudge**            | API_URL                            | http://api:8080                                                                     | Internal API service URL                              |
|                          | DB_PASSWORD_FILE                   | /run/secrets/db_password                                                            | File containing the database password                 |
|                          | DB_URL                             | jdbc:postgresql://postgres:5432/forseti                                             | JDBC URL for PostgreSQL database connection           |
|                          | DB_USER                            | forseti                                                                             | Database username                                     |
|                          | JAVA_TOOL_OPTIONS                  | "-XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:MinRAMPercentage=25.0" | JVM memory settings (min and max heap size)           |
|                          | SESSION_AUTOJUDGE_EXPIRATION       | 10m                                                                                 | Session expiration time for autojudge service         |
|                          | MAX_CONCURRENT_SUBMISSIONS         | 1                                                                                   | Maximum number of concurrent submissions per instance |
|                          | MINIO_ENDPOINT                     | http://minio:9000                                                                   | MinIO S3-compatible storage endpoint                  |
|                          | MINIO_ACCESS_KEY                   | forseti                                                                             | MinIO access key/username                             |
|                          | MINIO_SECRET_KEY_FILE              | /run/secrets/minio_password                                                         | File containing MinIO secret key                      |
|                          | MINIO_BUCKET                       | forseti                                                                             | MinIO bucket name for storing files                   |
|                          | RABBITMQ_HOST                      | rabbitmq                                                                            | RabbitMQ hostname                                     |
|                          | RABBITMQ_PORT                      | 5672                                                                                | RabbitMQ AMQP port                                    |
|                          | RABBITMQ_USER                      | forseti                                                                             | RabbitMQ username                                     |
|                          | RABBITMQ_PASSWORD_FILE             | /run/secrets/rabbitmq_password                                                      | File containing RabbitMQ password                     |
|                          | RABBITMQ_VHOST                     | /                                                                                   | RabbitMQ virtual host                                 |
|                          | RABBITMQ_SUBMISSION_QUEUE          | submission-queue                                                                    | Queue name for submissions                            |
|                          | RABBITMQ_SUBMISSION_EXCHANGE       | submission-exchange                                                                 | Exchange name for submissions                         |
|                          | RABBITMQ_SUBMISSION_ROUTING_KEY    | submission-routing-key                                                              | Routing key for submissions                           |
|                          | RABBITMQ_SUBMISSION_FAILED_QUEUE   | submission-failed-queue                                                             | Queue name for failed submissions                     |
|                          | ROOT_PASSWORD_FILE                 | /run/secrets/root_password                                                          | File containing root user password                    |
| **autojudge-autoscaler** | COOLDOWN                           | 60                                                                                  | Cooldown period in seconds between scaling operations |
|                          | INTERVAL                           | 10                                                                                  | Interval in seconds for checking queue metrics        |
|                          | MESSAGES_PER_REPLICA               | 5                                                                                   | Target number of messages per replica for scaling     |
|                          | MAX_REPLICAS                       | 3                                                                                   | Maximum number of autojudge replicas                  |
|                          | MIN_REPLICAS                       | 1                                                                                   | Minimum number of autojudge replicas                  |
|                          | QUEUE_NAME                         | submission-queue                                                                    | Name of the queue to monitor                          |
|                          | RABBITMQ_HOST                      | rabbitmq                                                                            | RabbitMQ hostname                                     |
|                          | RABBITMQ_PORT                      | 15672                                                                               | RabbitMQ management API port                          |
|                          | RABBITMQ_USER                      | forseti                                                                             | RabbitMQ username                                     |
|                          | RABBITMQ_PASSWORD_FILE             | /run/secrets/rabbitmq_password                                                      | File containing RabbitMQ password                     |
|                          | RABBITMQ_VHOST                     | /                                                                                   | RabbitMQ virtual host                                 |
|                          | SERVICE_NAME                       | forseti_autojudge                                                                   | Docker Swarm service name to scale                    |
| **grafana**              | DB_URL                             | postgres:5432                                                                       | PostgreSQL connection URL                             |
|                          | DB_NAME                            | forseti                                                                             | PostgreSQL database name                              |
|                          | DB_USER                            | forseti                                                                             | PostgreSQL username                                   |
|                          | DB_PASSWORD_FILE                   | /run/secrets/db_password                                                            | File containing the database password                 |
|                          | GF_SECURITY_ADMIN_USER             | root                                                                                | Grafana admin username                                |
|                          | GF_SECURITY_ADMIN_PASSWORD\_\_FILE | /run/secrets/root_password                                                          | File containing Grafana admin password                |
|                          | LOKI_URL                           | http://loki:3100                                                                    | Loki logging service URL                              |
|                          | PROMETHEUS_URL                     | http://prometheus:9090                                                              | Prometheus metrics service URL                        |
| **migration**            | FLYWAY_URL                         | jdbc:postgresql://postgres:5432/forseti                                             | Flyway JDBC URL for database migrations               |
|                          | FLYWAY_USER                        | forseti                                                                             | Flyway database username                              |
| **minio**                | MINIO_ROOT_USER                    | forseti                                                                             | MinIO root username                                   |
|                          | MINIO_ROOT_PASSWORD_FILE           | /run/secrets/minio_password                                                         | File containing MinIO root password                   |
| **postgres**             | POSTGRES_USER                      | forseti                                                                             | PostgreSQL username                                   |
|                          | POSTGRES_PASSWORD_FILE             | /run/secrets/db_password                                                            | File containing PostgreSQL password                   |
|                          | POSTGRES_DB                        | forseti                                                                             | PostgreSQL database name                              |
| **postgres-exporter**    | DATA_SOURCE_URI                    | postgres:5432/forseti?sslmode=disable                                               | PostgreSQL data source URI for exporter               |
|                          | DATA_SOURCE_USER                   | forseti                                                                             | PostgreSQL username for exporter                      |
|                          | DATA_SOURCE_PASS_FILE              | /run/secrets/db_password                                                            | File containing database password for exporter        |
| **rabbitmq**             | RABBITMQ_USER                      | forseti                                                                             | RabbitMQ username                                     |
|                          | RABBITMQ_PASSWORD_FILE             | /run/secrets/rabbitmq_password                                                      | File containing RabbitMQ password                     |
| **webapp**               | API_INTERNAL_URL                   | http://api:8080                                                                     | Internal API URL for server-side requests             |
|                          | API_PUBLIC_URL                     | https://api.forseti.live                                                            | Public API URL for client-side requests               |
|                          | LOCALE                             | en-US                                                                               | Application locale/language                           |

### Important Configuration Notes

**Security:**

- All sensitive credentials should be stored as Docker secrets
- Use strong, unique passwords for each service

**Session Management:**

- `SESSION_EXPIRATION`: Balance between user convenience and security
- `SESSION_ROOT_EXPIRATION`: Should be shorter than regular sessions for admin accounts
- `SESSION_AUTOJUDGE_EXPIRATION`: Keep short as autojudge authenticates frequently

**AutoJudge Scaling:**

- `MAX_CONCURRENT_SUBMISSIONS`: Increase for better throughput if you have sufficient resources
- `MESSAGES_PER_REPLICA`: Lower values = more aggressive scaling; higher = more conservative
- `MIN_REPLICAS`: Should be at least 1 to handle baseline load
- `MAX_REPLICAS`: Set based on cluster capacity and expected peak load
- `COOLDOWN`: Prevents rapid scaling oscillations; increase if experiencing instability
- `INTERVAL`: Lower values provide faster response to load changes but increase overhead

> **Important:** The maximum system capacity for concurrent submissions is calculated as `MAX_REPLICAS × MAX_CONCURRENT_SUBMISSIONS`. Before increasing these values, verify that:
> - Your infrastructure has sufficient CPU and memory resources to handle peak load
> - Each submission can execute within its configured time and memory limits without resource contention
> - The system maintains fair resource allocation across all concurrent executions

## CLI Commands

The CLI tool (`./forseti`) provides commands for installing, configuring, and managing the platform.

### Installation

Prepare the environment by pulling Docker images, installing code execution sandboxes, and generating TLS certificates:

```shell
./forseti install
```

This command:

- Downloads all required Docker images
- Sets up isolated execution environments for various programming languages
- Generates self-signed TLS certificates for HTTPS

#### Client Setup

After completing the installation on the master machine, each client machine in the local network requires additional configuration to access the platform:

**1. Install mkcert CA Certificate**

The self-signed TLS certificates generated during installation need to be trusted by client browsers. Install the mkcert Certificate Authority (CA) on each client machine:

- Locate the CA certificate in the `certs/` directory on the master machine
- Copy and install it on each client following mkcert's installation procedures for the respective operating system

**2. Configure Hosts File**

Add the following entries to the hosts file on each client machine to resolve the Forseti Judge platform domains to the master machine's IP address:

```
<master-ip>  forseti.live
<master-ip>  api.forseti.live
<master-ip>  grafana.forseti.live
```

> **Note:** Replace `<master-ip>` with the actual IP address of the master machine. The `grafana.forseti.live` entry is optional and only needed if you want to access the monitoring dashboard from client machines.

**Hosts File Locations:**

- **Linux/macOS**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

> **Tip:** Administrative/root privileges are required to modify the hosts file.

### Swarm Management

Initialize a Docker Swarm cluster (run this on the manager node):

```shell
./forseti swarm init
```

Display Docker Swarm join tokens and manager IP address:

```shell
./forseti swarm info
```

Add worker nodes to the swarm (run this on each worker node):

```shell
./forseti swarm join --token <token> --manager-ip <manager-ip>
```

> **Note:** Replace `<token>` with the worker token from `./forseti swarm info` and `<manager-ip>` with the manager node's IP address.

Remove a node from the swarm (run on the node you want to remove):

```shell
./forseti swarm leave
```

### System Operations

Deploy and start all services:

```shell
./forseti system start
```

Check the status of all services and their health:

```shell
./forseti system status
```

> **Tip:** Wait for all services to show as healthy before using the platform. Initial startup may take several minutes.

Manually scale a specific service (useful for load testing or peak periods):

```shell
./forseti system scale <service> <replicas>
```

> **Warning:** Manual scaling of the `autojudge` service will be overridden by the autoscaler. Consider adjusting `MIN_REPLICAS` and `MAX_REPLICAS` environment variables instead.

Update a service (useful after configuration changes):

```shell
./forseti system update <service>
```

Gracefully stop all services:

```shell
./forseti system stop
```

### Backup

Create backups of all persistent data volumes:

```shell
./forseti backup
```

Backups are stored in the `backups/` directory and include:

- PostgreSQL database
- MinIO object storage
- RabbitMQ queues and configuration
- Grafana dashboards and settings
- Prometheus metrics data
- Loki log data

> **Best Practice:** Schedule regular backups using cron:
>
> ```
> 0 2 * * * ./forseti backup
> ```

## Monitoring

### Grafana

**Access:** `https://grafana.forseti.live`

**Credentials:** `root` / your root password

#### Overview

Grafana provides real-time monitoring and visualization of system metrics, logs, and application performance. The platform comes pre-configured with data sources and dashboards to help you monitor contest operations.

#### Pre-configured Data Sources

- **Prometheus**: System and application metrics
- **Loki**: Centralized logging from all services
- **PostgreSQL**: Direct database queries for custom analytics

#### Default Dashboard: System Overview

The built-in "System overview" dashboard provides comprehensive monitoring across multiple dimensions:

**Infrastructure Metrics:**

- **CPU Usage per Node**: Track CPU utilization across all swarm nodes
- **Memory Usage per Node**: Monitor memory consumption per node to identify resource constraints
- **CPU Usage per Container**: Identify resource-intensive services
- **Memory Usage per Container**: Detect memory leaks or services approaching limits

**Storage Metrics:**

- **MinIO Storage**: Object storage capacity and usage trends
- **PostgreSQL Storage**: Database size and growth patterns

**Application Metrics:**

- **Messages Per Queue**: RabbitMQ queue depths for submission processing
- **Autojudge AutoScaler Replicas**: Current number of active autojudge instances
- **Active Sandboxes**: Number of concurrent code executions
- **Latency P90**: 90th percentile response time for API requests
- **Availability**: Service uptime and health status

#### Creating Custom Dashboards

You can create additional dashboards to monitor specific aspects of your contest:

1. Navigate to **Dashboards** → **New** → **New Dashboard**
2. Add panels using PromQL queries for Prometheus metrics
3. Use LogQL queries to visualize Loki log data

#### Alerting

Configure alerts to be notified of critical issues:

1. Go to **Alerting** → **Alert rules** → **New alert rule**
2. Define conditions (e.g., high CPU usage, queue backlog)
3. Configure notification channels (email, Slack, webhooks)
4. Set appropriate thresholds based on your contest scale
