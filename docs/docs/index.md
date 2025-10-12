# Forseti Judge Platform

A comprehensive, production-ready platform for running secure and scalable competitive programming contests.

## Overview

Forseti Judge is a fullstack distributed system designed to manage competitive programming contests in secure, offline environments. With features for isolated code execution, real-time judging, leaderboards, and contest administration, it operates entirely without internet connectivity once deployed. Built with modern technologies and deployed using Docker Swarm, it provides a robust, self-contained solution for contests of any scale—from small educational events to large-scale competitions with hundreds of participants.

### Key Features

**🔒 Security First**

- Isolated execution environments using Docker sandboxes
- Code runs without internet access to prevent data exfiltration
- HTTPS encryption with self-signed TLS certificates
- Secure session-based authentication

**⚡ Real-Time Experience**

- Live leaderboard updates via WebSocket
- Instant submission verdict notifications
- Real-time contest announcements and clarifications
- Automatic code execution and judging

**📊 Contest Management**

- Comprehensive admin dashboard for contest configuration
- Support for multiple programming languages (C++, Java, Python)
- Flexible problem management with custom time/memory limits
- Role-based access control (Root, Admin, Judge, Contestant, Guest)

**🚀 Scalable Architecture**

- Distributed microservices architecture
- Auto-scaling autojudge service based on submission queue depth
- Load balancing and rate limiting with Traefik
- Comprehensive monitoring with Prometheus, Loki, and Grafana

**🎯 Fair Competition**

- Standardized scoring and penalty system
- Configurable contest timing and rules
- Clarification system for participant questions
- Manual override capabilities for judges

### Technology Stack

**Frontend:**

- Next.js - Server-side rendered web application
- React - Interactive user interface components
- WebSocket - Real-time updates

**Backend:**

- JVM (Kotlin) - API and Autojudge services
- PostgreSQL - Relational database
- RabbitMQ - Message broker for submission queue
- MinIO - S3-compatible object storage

**Infrastructure:**

- Docker Swarm - Container orchestration
- Traefik - Reverse proxy and load balancer
- Prometheus - Metrics collection
- Grafana - Monitoring dashboards
- Loki - Log aggregation

**Supported Programming Languages:**

- C++ 17
- Java 21
- Python 3.12

## Documentation Structure

This documentation is organized into three main sections:

### [Setup](setup.md)

Comprehensive operational guide covering:

- Security architecture and isolated environment configuration
- Resource allocation and scaling guidelines
- Environment variable reference for all services
- CLI commands for installation and system management
- Backup procedures and data recovery
- Monitoring with Grafana dashboards

**Start here** if you're deploying the platform or managing infrastructure.

### [Usage](usage.md)

User-focused guide for participants and organizers:

- CLI commands for contest management
- Dashboard walkthroughs for each role (Root, Admin, Judge, Contestant, Guest)
- Contest rules and scoring system
- Submission workflow and verdict types
- Clarifications and announcements

**Start here** if you're running a contest or participating in one.

### [Development](development.md)

Technical reference for developers:

- System architecture and component interactions
- Database schema and entity relationships
- HTTP REST API documentation
- WebSocket topics for real-time updates
- RabbitMQ message queue structure
- Sandbox execution environment details

**Start here** if you're contributing to the project or building integrations.

## Support and Resources

- **GitHub Repository**: [leonfoliveira/forseti](https://github.com/leonfoliveira/forseti)
- **Report Issues**: [GitHub Issues](https://github.com/leonfoliveira/forseti/issues)
- **Latest Release**: [Releases Page](https://github.com/leonfoliveira/juforsetidge/releases)

## License

See the [LICENSE](https://github.com/leonfoliveira/forseti/blob/main/LICENSE) file in the repository.

---

**Ready to get started?** Head to the [Setup Guide](setup.md) for installation instructions, or jump to the [Usage Guide](usage.md) if your platform is already running.
