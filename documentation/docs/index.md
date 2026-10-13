# Forseti Judge Platform

A comprehensive, production-ready platform for running secure and scalable competitive programming contests. Forseti provides everything you need to host programming competitions, from secure code execution to real-time monitoring and automatic scaling.

Forseti is designed for educational institutions, organizations, and contest hosts who need a robust, secure, and scalable solution. Built with a microservices architecture and deployed on AWS, Forseti handles the complete contest lifecycle from problem management to automatic judging.

## Key Features

### **Secure Code Execution**
- Isolated Docker container execution for untrusted code submissions
- Resource limits enforced at kernel level
- Support for multiple programming languages
- Defense-in-depth approach for maximum security

### **Auto-Scaling & Performance**
- Automatically scales autojudge instances based on workload
- Optimized for high-throughput contest environments
- Real-time performance monitoring and alerting

### **Contest Management**
- Full contest lifecycle management
- Multiple user roles: Admin, Judge, Contestant, Guest
- Real-time leaderboards and submission tracking
- WebSocket-based live updates

### **Production-Ready Infrastructure**
- Automated database migrations with Flyway
- AWS managed services for storage, database, caching, and messaging
- High availability with AWS infrastructure

### **Modern Web Interface**
- Responsive Next.js frontend with TypeScript
- Intuitive dashboards for all user types
- Real-time contest participation experience

## Next Steps

- **[Architecture Overview](architecture.md)**: Understand the overall system architecture
- **[Database Overview](database.md)**: Learn about the database schema and structure.
