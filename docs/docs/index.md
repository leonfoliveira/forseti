# Forseti Judge Platform

A comprehensive, production-ready platform for running secure and scalable competitive programming contests. Forseti provides everything you need to host programming competitions, from secure code execution to real-time monitoring and automatic scaling.

## What is Forseti?

Forseti is a modern competitive programming judge platform designed for educational institutions, organizations, and contest hosts who need a robust, secure, and scalable solution. Built with a microservices architecture and deployed using Docker Swarm, Forseti handles the complete contest lifecycle from problem management to automatic judging.

## Network Environment

Forseti is specifically designed to operate in **closed LAN environments without internet access**, making it ideal for secure competitive programming contests where network isolation is required. Key networking characteristics:

- **Offline Operation**: Once deployed, the system runs entirely within your local network without requiring internet connectivity
- **LAN-Only Access**: All services communicate internally and are accessible only within your network infrastructure  
- **Self-Signed Certificates**: The system automatically generates its own TLS certificates using Mkcert for secure TLS communication
- **Installation Requirement**: Internet access is only needed during installation to pull Docker images from registries

This design ensures maximum security and control for contest environments while maintaining professional-grade TLS encryption through self-signed certificates.

> **Note**: While Forseti can technically be deployed on the internet, such deployments require additional security configurations, proper certificate management, and network hardening that are beyond the scope of this documentation. The platform is optimized and documented for secure LAN deployments.

## Key Features

### **Secure Code Execution**
- Isolated Docker container execution for untrusted code submissions
- Resource limits enforced at kernel level
- Support for multiple programming languages (C++17, Java 21, Python 3.12)
- Defense-in-depth approach for maximum security

### **Auto-Scaling & Performance**
- Intelligent autoscaler monitors submission queues
- Automatically scales judge instances based on workload
- Optimized for high-throughput contest environments
- Real-time performance monitoring and alerting

### **Contest Management**
- Full contest lifecycle management
- Multiple user roles: Admin, Staff, Judge, Contestant, Guest
- Real-time leaderboards and submission tracking
- WebSocket-based live updates

### **Production-Ready Infrastructure**
- Complete observability stack (Prometheus, Grafana, Loki, Tempo)
- Automated database migrations with Flyway
- S3-compatible object storage for test cases and submissions
- High availability with Docker Swarm clustering

### **Modern Web Interface**
- Responsive Next.js frontend with TypeScript
- Intuitive dashboards for all user types
- Real-time contest participation experience
- Multi-language support (English, Portuguese)

## System Architecture

Forseti consists of several key services working together:

- **API Server**: Spring Boot backend handling all business logic
- **AutoJudge**: Secure code execution service with language support
- **WebApp**: Modern Next.js frontend application
- **CLI**: Python-based management tool for deployment and administration

The platform also includes comprehensive infrastructure services for monitoring, logging, message queuing, and data storage. See the [Stack](stack.md) documentation for detailed service descriptions.

## Getting Started

1. **Setup the CLI**: Use the [CLI](cli.md) to initialize your Forseti deployment
2. **Deploy the Stack**: Follow the [Stack](stack.md) deployment guide
3. **Create Contest**: Use the CLI to create a contest
4. **Update Contest**: Sign in to the WebApp to manage contest details, problems and members
5. **Invite Participants**: Share contest URL with contestants

## Requirements

**Manager node:**

- [Docker](https://www.docker.com/) ^26.1.3
- [Mkcert](https://github.com/FiloSottile/mkcert) ^1.4.4

**Worker nodes:**

- [Docker](https://www.docker.com/) ^26.1.3

**Client machines:**

- Any modern web browser

## Next Steps

- **[Stack Overview](stack.md)**: Understand the system architecture
- **[Rules](rules.md)**: Learn about contest rules and member permissions
- **[CLI Documentation](cli.md)**: Learn how to deploy and manage Forseti
- **[WebApp Guide](webapp/overview.md)**: Explore the webapp interface
- **[Domain](backend/domain.md)**: Learn about the domain of Forseti
- **[API Documentation](backend/api.md)**: Learn about the main Forseti service
- **[AutoJudge Details](backend/autojudge.md)**: Learn about secure code execution