# Forseti Judge Platform - AI Agent Instructions

## Project Overview

Forseti is a production-ready competitive programming judge platform built with a distributed microservices architecture. The system runs code submissions in isolated Docker sandboxes, scales automatically based on queue depth, and provides real-time updates via WebSocket.

**Core Stack:**

- **Backend:** Kotlin/JVM (Spring Boot) with Gradle multi-module structure
- **Frontend:** Next.js 15 (React 19) with TypeScript, TailwindCSS, Redux Toolkit
- **Infrastructure:** Docker Swarm, PostgreSQL, RabbitMQ, MinIO (S3-compatible), Grafana/Prometheus/Loki/Tempo observability
- **Autoscaler:** Python service that scales autojudge replicas based on RabbitMQ queue metrics

## Architecture & Service Boundaries

### Service Responsibilities

1. **API (`applications/backend/api/`)**: HTTP REST + WebSocket server
   - Cookie-based session authentication with `@Private` annotation for authorization
   - Publishes submissions to `submission-queue` via RabbitMQ
   - Consumes from `submission-failed-queue` to emit failures via WebSocket
   - Real-time contest updates via STOMP over SockJS (`/ws` endpoint)

2. **Autojudge (`applications/backend/autojudge/`)**: Code execution worker
   - Consumes from `submission-queue`, executes code in isolated alpine:3.22.1 sandboxes
   - Enforces strict security: `--network=none`, `--cap-drop=ALL`, resource limits
   - Auto-scaled by autoscaler (0-3 replicas by default, see `MIN_REPLICAS`/`MAX_REPLICAS`)

3. **Core (`applications/backend/core/`)**: Shared domain logic
   - Domain entities (`Contest`, `Problem`, `Submission`, etc.) with soft-delete via `BaseEntity`
   - Service layer (e.g., `FindContestService`, `CreateSubmissionService`)
   - Event-driven architecture: `SubmissionCreatedEvent` triggers RabbitMQ publishing
   - Flyway migrations in `src/main/resources/migration/`

4. **Infrastructure (`applications/backend/infrastructure/`)**: External adapters
   - `DockerContainer`: Manages sandbox lifecycle with security hardening
   - RabbitMQ, PostgreSQL, MinIO adapters

5. **Autoscaler (`applications/autoscaler/`)**: Python-based autoscaler
   - Monitors `submission-queue` depth every `INTERVAL` seconds
   - Scales autojudge replicas based on `MESSAGES_PER_REPLICA` ratio
   - Enforces `COOLDOWN` period to prevent oscillation

6. **CLI (`applications/cli/`)**: PyInstaller-based operational tool (`./forseti`)
   - Commands: `install`, `swarm init/join/info/leave`, `system start/stop/status/scale/update`, `backup`
   - Generates self-signed TLS certs for HTTPS, manages Docker secrets

7. **WebApp (`applications/webapp/`)**: Next.js SSR frontend
   - Role-based dashboards: Root, Admin, Judge, Contestant, Guest
   - Real-time WebSocket subscriptions (announcements, clarifications, submissions, leaderboard)
   - i18n with `next-intl` (extract: `npm run i18n:extract`, verify: `npm run i18n:verify`)

### Key Communication Patterns

- **RabbitMQ Queues:**
  - `submission-queue` → consumed by autojudge
  - `submission-failed-queue` → consumed by API (DLQ for submission-queue)
  - `submission-dlq` → DLQ for submission-failed-queue

- **WebSocket Topics (STOMP):**
  - `/topic/contests/{contestId}/announcements`
  - `/topic/contests/{contestId}/clarifications`
  - `/topic/contests/{contestId}/submissions` (public)
  - `/topic/contests/{contestId}/submissions/full` (judges/admins)
  - `/topic/contests/{contestId}/submissions/full/members/{memberId}` (contestant's own)
  - `/topic/contests/{contestId}/leaderboard`

## Development Workflows

### Backend (Kotlin/Gradle)

**Build:**

```bash
cd applications/backend
./gradlew build  # Runs all tests across subprojects
```

**Run Locally:**

```bash
# Set SPRING_PROFILES_ACTIVE=development (uses core-development.yml)
./gradlew :api:bootRun
./gradlew :autojudge:bootRun
```

**Testing:**

- Uses Kotest BDD style: `describe("MyClass")`, `context("when X")`, `it("should Y")`
- `shouldThrow<ExceptionType>` for exception assertions
- Testcontainers for PostgreSQL, RabbitMQ, MinIO (see `core/testFixtures`)
- Coverage enforced at 90% (Kover)

**Key Configuration Files:**

- `settings.gradle.kts`: Defines subprojects (`api`, `autojudge`, `core`, `infrastructure`)
- `build.gradle.kts`: Shared dependencies, ktlint, kover, Java 21 toolchain
- `core/build.gradle.kts`: Flyway setup (reads `core-{profile}.yml` for DB credentials)

**Authorization Pattern:**

```kotlin
@Private(Member.Type.ADMIN, Member.Type.JUDGE)  // Requires ADMIN or JUDGE
@Private  // Any authenticated user
// No annotation = public endpoint
```

### Frontend (Next.js/TypeScript)

**Development:**

```bash
cd applications/webapp
npm run dev  # Turbopack-enabled dev server
```

**Testing:**

```bash
npm run test          # Jest with React Testing Library
npm run test:coverage # Coverage report (90% threshold via jest.config.ts)
```

**Key Patterns:**

- State management: Redux Toolkit slices (e.g., `admin-dashboard-slice.ts`)
- Providers wrap dashboards (e.g., `AdminDashboardProvider` subscribes to WebSocket topics)
- Tests use `renderWithProviders()` helper for Redux/Intl context
- Styling: TailwindCSS 4 + DaisyUI components

**i18n Workflow:**

1. Add messages with `intl.formatMessage({ id: "key.path" })`
2. Extract: `npm run i18n:extract` → updates `src/i18n/messages/en-US.json`
3. Verify completeness: `npm run i18n:verify`

### Python Services (Autoscaler/CLI)

**Setup:**

```bash
cd applications/autoscaler  # or applications/cli
make install  # pip install -r requirements.dev.txt
```

**Testing:**

```bash
make test  # pytest with 90% coverage threshold (pyproject.toml)
```

**Linting/Formatting:**

```bash
make lint   # black --check, isort --check-only, flake8
make format # black, isort
```

### Deployment (Docker Swarm)

**Initial Setup:**

```bash
cd deployment/production
../../cli/forseti install           # Pulls images, generates certs, installs sandboxes
../../cli/forseti swarm init        # Initialize swarm on manager node
../../cli/forseti system start      # Deploy stack from stack.yaml
../../cli/forseti system status     # Check service health
```

**Resource Configuration:**

- Edit `stack.yaml` to adjust `deploy.resources.{limits,reservations}`
- Autoscaler env vars: `MIN_REPLICAS`, `MAX_REPLICAS`, `MESSAGES_PER_REPLICA`, `COOLDOWN`
- Default: 1-3 autojudge replicas, scaled based on 5 messages/replica

**Secrets Management:**

- Docker secrets: `db_password`, `minio_password`, `rabbitmq_password`, `redis_password`, `root_password`
- Mounted as files (`_FILE` suffix env vars), e.g., `DB_PASSWORD_FILE=/run/secrets/db_password`

## Project-Specific Conventions

### Kotlin/Backend

1. **Package Structure (Hexagonal Architecture):**
   - `domain/entity/`: JPA entities (extend `BaseEntity` for soft-delete, timestamps)
   - `domain/model/`: Value objects (e.g., `RequestContext` using ThreadLocal)
   - `application/service/`: Business logic services
   - `adapter/driving/`: Inbound adapters (REST controllers, RabbitMQ consumers)
   - `adapter/driven/`: Outbound adapters (repositories, external APIs)

2. **Naming Conventions:**
   - Services: `{Verb}{Entity}Service` (e.g., `FindContestService`, `CreateSubmissionService`)
   - DTOs: `{Entity}{In/Out}putDTO` (e.g., `CreateContestInputDTO`, `ContestOutputDTO`)
   - Ports: `{Verb}{Entity}Port` (interfaces in `port/`)

3. **Domain Enums:**
   - `Member.Type`: ROOT, AUTOJUDGE, CONTESTANT, JUDGE, ADMIN
   - `Submission.Status`: JUDGING, FAILED, JUDGED
   - `Submission.Answer`: NO_ANSWER, ACCEPTED, WRONG_ANSWER, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED
   - `Submission.Language`: CPP_17, JAVA_21, PYTHON_312

4. **Security Best Practices:**
   - Always use `@Private` annotation on sensitive endpoints
   - ROOT user bypasses all authorization checks
   - Contest membership verified dynamically in service layer (not just `@Private`)

### TypeScript/Frontend

1. **File Organization:**
   - `src/adapter/`: API clients (Axios) and WebSocket listeners (STOMP)
   - `src/lib/component/`: Reusable UI components
   - `src/lib/provider/`: Context providers for role-based dashboards
   - `src/store/slices/`: Redux Toolkit slices
   - `test/`: Mirrors `src/` structure with `.test.tsx` files

2. **Testing Conventions:**
   - Use `renderWithProviders()` for all component tests (adds Redux + Intl)
   - Mock timers: `jest.advanceTimersByTime()` for countdown tests
   - WebSocket mocks: `jest-mock-extended` for STOMP clients

3. **Styling:**
   - Prefer DaisyUI semantic classes (`btn`, `card`, `badge`) over raw Tailwind
   - Custom colors defined in `tailwind.config.ts`

### Python

1. **Testing:**
   - Fixtures in `conftest.py` (e.g., `docker_client()` for autoscaler)
   - Coverage omits entrypoints (`__main__.py`, `api.py`)

2. **CLI Binary:**
   - Built via `make build` (PyInstaller) → `build/forseti` executable
   - Version injected by `generate_version.py --version <tag>`

## Critical Gotchas

1. **Docker Sandbox Isolation:**
   - Autojudge requires `/var/run/docker.sock` mount to create sandboxes
   - Sandboxes use `alpine:3.22.1` with `--network=none`, `--cap-drop=ALL`
   - OOM kills detected via `DockerContainer.DockerOOMKilledException`

2. **Database Migrations:**
   - Flyway in `core/src/main/resources/migration/` (SQL files)
   - Run manually: `./gradlew flywayMigrate` (reads `core-{profile}.yml`)
   - Production: `migration` service in `stack.yaml` auto-applies on startup

3. **Session Expiration:**
   - ROOT: 3h (`SESSION_ROOT_EXPIRATION`)
   - Regular users: 6h (`SESSION_EXPIRATION`)
   - Autojudge: 10m (`SESSION_AUTOJUDGE_EXPIRATION`)
   - Validate `expiresAt` in `HttpContextExtractionFilter` before processing

4. **WebSocket Auth:**
   - STOMP connects with session cookie, no separate auth
   - Topic subscriptions enforced by broker ACL (configured in `rabbitmq/definitions.template.json`)

5. **Resource Limits:**
   - Max concurrent submissions = `MAX_REPLICAS × MAX_CONCURRENT_SUBMISSIONS`
   - Verify infrastructure can handle peak: `3 replicas × 1 concurrent = 3 sandboxes` (default)

6. **Testing Requirement:**
   - All projects enforce 90% line coverage (fail builds if below)
   - Backend: Kover, Frontend: Jest, Python: pytest-cov

## Common Tasks

**Add New Endpoint:**

1. Create DTO in `core/port/dto/`
2. Add service in `core/application/service/{domain}/`
3. Add controller in `api/adapter/driving/controller/` with `@Private` if needed
4. Write Kotest integration test

**Add New Entity Field:**

1. Update entity in `core/domain/entity/`
2. Create Flyway migration: `V{version}__{description}.sql`
3. Run `./gradlew flywayMigrate` to apply
4. Update related DTOs and mappers

**Scale Autojudge:**

- Temporary: `./forseti system scale forseti_autojudge <replicas>`
- Permanent: Edit `MAX_REPLICAS` in `stack.yaml` → `./forseti system update forseti_autojudge-autoscaler`

**Debug Production:**

- Logs: `docker service logs forseti_<service> --follow`
- Grafana: `https://grafana.forsetijudge.com` (dashboards: "System overview")
- Traces: Tempo integrated via Alloy (`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`)
