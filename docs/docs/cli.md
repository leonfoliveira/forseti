# CLI

The Forseti CLI is a command-line interface for managing Forseti deployments, contests, and Docker infrastructure. Built with Python and Typer, it provides comprehensive tools for installation, deployment, monitoring, and administration of Forseti environments.

## Key Features

- **Infrastructure Management**: Docker Swarm initialization, stack deployment, and scaling
- **Contest Administration**: Creating, deleting, and listing contests via API integration
- **System Operations**: Backup creation, certificate installation, and sandbox building
- **Monitoring**: Real-time status monitoring

## Directory Structure

The Forseti CLI expects a specific directory structure for deployment operations. This structure must be present in your working directory before executing stack management commands:

```
<folder>/
    sandboxes/          # AutoJudge execution images
    volumes/            # Services configurations
    forseti             # CLI executable binary
    stack.conf          # System parameters configuration file
    stack.yaml.j2       # Docker Swarm template
```

## Configuration

Use stack.conf to adjust systems parameters like:

- `global.domain`: The URL domain for the Forseti system. Traefik will use this domain to route incoming requests to the appropriate services. Certificates will also be generated for this domain.
- `global.https`: Enable or disable HTTPS. If enabled, self-signed certificates will be generated for the specified domain. Recommended to keep enabled for secure communication.
- `session.expiration`: Duration after which user sessions will expire. Adjust based on security requirements and user activity patterns.
- `session.root_expiration`: Duration after which root sessions will expire. Root sessions have elevated privileges, so it's recommended to set a shorter expiration time for enhanced security.
- `session.system_expiration`: Duration after which system sessions will expire. System sessions are used for internal operations, so setting a short expiration time can help mitigate potential security risks.
- `<service>.replicas`: Number of replicas for each service. Adjust based on expected load and resource availability. Only applicable for `api` and `webapp`. `autojudge` is auto-scaled by `autojudge-autoscaler`.
- `<service>.ratelimit_average`: Average rate limit for incoming requests to the service. Adjust based on expected traffic and performance requirements. Only applicable for `alloy`, `api`, `grafana` and `webapp`.
- `<service>.ratelimit_burst`: Burst rate limit for incoming requests to the service. Adjust based on expected traffic spikes and performance requirements. Only applicable for `alloy`, `api`, `grafana` and `webapp`.
- `<service>.cpus_limit`: CPU limit for the service. Adjust based on expected load and resource availability.
- `<service>.memory_limit`: Memory limit for the service. Adjust based on expected load and resource availability.
- `<service>.cpus_reservation`: CPU reservation for the service. Adjust based on expected load and resource availability.
- `<service>.memory_reservation`: Memory reservation for the service. Adjust based on expected load and resource availability.
- `autojudge.max_concurrent_submissions`: Maximum number of concurrent submissions that one instance of autojudge can process. Adjust based on expected submission volume and resource availability.
- `autojudge_autoscaler.cooldown`: Cooldown period for autojudge autoscaler to wait before scaling down. Adjust based on expected submission patterns and resource availability.
- `autojudge_autoscaler.interval`: Interval for autojudge autoscaler to check the number of pending submissions and adjust the number of autojudge instances accordingly. Adjust based on expected submission patterns and resource availability.
- `autojudge_autoscaler.messages_per_replica`: Number of pending submissions per autojudge instance before scaling up. Adjust based on expected submission volume and resource availability.
- `autojudge_autoscaler.max_replicas`: Maximum number of autojudge instances that can be scaled up. Adjust based on expected submission volume and resource availability.
- `autojudge_autoscaler.min_replicas`: Minimum number of autojudge instances to keep running. Adjust based on expected submission volume and resource availability.
- `redis.maxmemory`: Maximum memory limit for Redis. Adjust based on expected load and resource availability.
- `webapp.locale`: Locale for the web application. Adjust based on user base and language preferences. Available options are `en-US` and `pt-BR`.

## Commands

### `install`

Installs all necessary dependencies for Forseti, including:
- Self-signed certificates
- Autojudge sandboxes built
- Stack images pull

**Options:**

- `--sandboxes`: List of sandboxes to install (default: cpp17, java21, python312)

**After the installation process, if it is required to update the hosts file on every machine that will access the system**

Linux/Mac File: `/etc/hosts`

Windows File: `C:\Windows\System32\drivers\etc\hosts`

```
<MANAGER_ADDRESS> <DOMAIN> alloy.<DOMAIN> api.<DOMAIN> grafana.<DOMAIN>
```

Where `<MANAGER_ADDRESS>` is the IP address of the swarm manager node and `<DOMAIN>` is the domain specified in `stack.conf`.

### `backup`

Creates compressed backups of all Forseti volumes.

<hr />

### `contest create [SLUG]`

Creates a new contest with specified slug.

**Arguments:**

- `SLUG`: Unique identifier for the contest

### `contest delete [CONTEST_ID]`

Deletes an existing contest by ID.

**Arguments:**

- `CONTEST_ID`: Numeric ID of the contest to delete

### `contest ls`

Lists all available contests with details.

<hr />

### `stack deploy`

Deploys the complete Forseti stack to Docker Swarm.

**Options:**

- `-y, --yes`: Skip confirmation prompt
- `-f, --force`: Force redeployment even if already deployed

### `stack rm`

Removes the deployed Forseti stack.

**Options:**

- `-y, --yes`: Skip confirmation prompt

### `stack scale [SERVICE] [REPLICAS]`

Adjusts service replica counts.

### `stack status`

Displays status of all stack services.

**Options:**

- `--follow`: Keep streaming status updates

<hr />

### `swarm init`

Initializes a new Docker Swarm cluster.

**Options:**

- `--advertise-addr`: IP address to advertise to other nodes

### `swarm join [TOKEN] [MANAGER_ADDRESS]`

Joins an existing Docker Swarm as worker or manager.

**Arguments:**

- `TOKEN`: Join token from swarm manager
- `MANAGER_ADDRESS`: IP:port of swarm manager

### `swarm leave`

Removes current node from swarm cluster.

**Options:**

- `-f, --force`: Force leave even if manager

### `swarm info`

Displays comprehensive swarm cluster information, including join tokens.

### `swarm rotate-secrets`

Rotates Docker Swarm secrets.
