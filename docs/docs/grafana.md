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

- **ROOT** - Administrative access to all dashboards and Grafana configuration
- **ADMIN and STAFF** - Access to view and manage dashboards for the platform

## Authentication

Authentication to Grafana is handled through the main Forseti webapp:

1. Users must first authenticate through the webapp (web interface)
2. Upon successful authentication, the webapp sets a `session_id` cookie
3. When accessing Grafana, Traefik forwards the authentication request to `/api/v1/sessions/grafana`
4. The API validates the session and returns user identity headers
5. Grafana automatically provisions the user account based on the authenticated identity

This seamless integration ensures users don't need separate Grafana credentials while maintaining proper access control based on their Forseti platform role.
