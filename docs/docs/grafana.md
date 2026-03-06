# Grafana

Grafana provides observability dashboards for monitoring and analyzing the Forseti platform. It integrates with multiple data sources to offer comprehensive insights into system performance, logs, and distributed traces.

## Overview

The Grafana instance is configured with three primary data sources that collect telemetry data from all Forseti services:

- **Prometheus** - Metrics collection for performance monitoring, resource usage, and application health
- **Loki** - Centralized log aggregation for troubleshooting and audit trails  
- **Tempo** - Distributed tracing for request flow analysis and latency debugging

The UI can be accessed at `http[s]://grafana.<domain>` and provides pre-configured dashboards for key performance indicators, error rates, and system health metrics.

## Access Control

Access to Grafana is restricted to authorized users only. The following roles can view dashboards and metrics:

- **ROOT** - Full administrative access to all dashboards and Grafana configuration. Can access via both proxy authentication (when logged into webapp) and direct login (useful when no contests exist yet)
- **ADMIN and STAFF** - Access to view and manage dashboards for the platform. Require active webapp sessions for authentication

## Authentication

Grafana supports dual authentication modes to accommodate different user scenarios:

### Proxy Authentication

For authenticated webapp users, Grafana uses seamless proxy authentication:

1. Users authenticate through the webapp (web interface) 
2. Upon successful authentication, the webapp sets a `session_id` cookie
3. When accessing Grafana, Traefik forwards the authentication request to `/api/v1/sessions/grafana`
4. The API validates the session and returns user identity headers (`X-WEBAUTH-USER`, `X-WEBAUTH-NAME`)
5. Grafana automatically provisions the user account based on the authenticated identity

This seamless integration ensures users don't need separate Grafana credentials while maintaining proper access control based on their Forseti platform role.

### Basic Authentication

When proxy authentication fails (e.g., no active session, no contests created yet), Grafana falls back to its standard login page:

1. If `/api/v1/sessions/grafana` returns 401/403, Traefik passes the request through without auth headers
2. Grafana detects the absence of proxy auth headers and presents the login form
3. The ROOT member can authenticate directly with Grafana credentials:
    - **login**: `root`
    - **password**: Root password set during swarm initialization
4. This is particularly useful for ROOT users who need access before any contests are created
5. Other users (ADMIN, STAFF) will not have Grafana credentials and must authenticate via proxy authentication through the webapp
