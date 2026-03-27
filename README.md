# Forseti Judge Platform

[![License](https://img.shields.io/github/license/leonfoliveira/forseti?style=for-the-badge)](https://github.com/leonfoliveira/forseti/blob/main/LICENSE)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/leonfoliveira/forseti?style=for-the-badge&color=blue)](https://github.com/leonfoliveira/forseti/releases)
![GitHub commits](https://img.shields.io/github/commits-since/leonfoliveira/forseti/latest/main?style=for-the-badge&label=commits%20since&color=yellow)
[![Regression test](https://img.shields.io/github/actions/workflow/status/leonfoliveira/forseti/regression-test-branch.yaml?branch=main&style=for-the-badge&label=regression)](https://github.com/leonfoliveira/forseti/actions/workflows/regression-test-branch.yaml)

A comprehensive, production-ready platform for running secure and scalable competitive programming contests in an air-gapped environment.

## Key Features

### Secure Code Execution

- Isolated Docker container execution for untrusted code submissions
- Resource limits enforced at kernel level
- Support for multiple programming languages
- Defense-in-depth approach for maximum security

### Auto-Scaling & Performance

- Intelligent autoscaler monitors submission queues
- Automatically scales judge instances based on workload
- Optimized for high-throughput contest environments
- Real-time performance monitoring and alerting

### Contest Management

- Full contest lifecycle management
- Multiple user roles: Admin, Staff, Judge, Contestant, Guest
- Real-time leaderboards and submission tracking
- WebSocket-based live updates

### Production-Ready Infrastructure

- Complete observability stack (Prometheus, Grafana, Loki, Tempo)
- Automated database migrations with Flyway
- S3-compatible object storage for test cases and submissions
- High availability with Docker Swarm clustering

### Modern Web Interface

- Responsive Next.js frontend with TypeScript
- Intuitive dashboards for all user types
- Real-time contest participation experience
- Multi-language support (English, Portuguese)

## Documentation

📚 **[View Full Documentation](https://leonfoliveira.github.io/forseti/)**

For detailed information about setup, usage, and development, please visit our comprehensive documentation site.
