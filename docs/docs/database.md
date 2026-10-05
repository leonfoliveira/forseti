# Database Overview

Forseti uses a PostgreSQL database to store its core data. The database schema is designed to support the platform's microservices architecture, ensuring data integrity, scalability, and efficient querying. The key tables and their relationships are described below.

![Database schema](../img/database.jpg)

## Key Tables

### contest

- `id`: A unique UUIDv7 identifying the contest.
- `created_at`: The timestamp when the contest was created.
- `updated_at`: The timestamp when the contest was last updated.
- `deleted_at`: The timestamp when the contest was deleted, if applicable.
- `version`: The version number of the contest record, used for optimistic locking.
- `title`: The title of the contest.
- `slug`: The URL-friendly unique identifier for the contest.
- `languages`: The programming languages supported in the contest.
- `start_at`: The timestamp when the contest is scheduled to start.
- `end_at`: The timestamp when the contest is scheduled to end.

### member

- `id`: A unique UUIDv7 identifying the member.
- `created_at`: The timestamp when the member was created.
- `updated_at`: The timestamp when the member was last updated.
- `deleted_at`: The timestamp when the member was deleted, if applicable.
- `version`: The version number of the member record, used for optimistic locking.
- `contest_id`: The UUIDv7 of the contest the member is associated with, if applicable.
- `type`: The role of the member within the contest.
- `name`: The name of the member.
- `login`: The login username of the member.
- `password`: The hashed password of the member.

### attachment

- `id`: A unique UUIDv7 identifying the attachment.
- `created_at`: The timestamp when the attachment was created.
- `updated_at`: The timestamp when the attachment was last updated.
- `deleted_at`: The timestamp when the attachment was deleted, if applicable.
- `version`: The version number of the attachment record, used for optimistic locking.
- `contest_id`: The UUIDv7 of the contest the attachment is associated with.
- `member_id`: The UUIDv7 of the member that uploaded the attachment, if applicable.
- `filename`: The name of the attachment file.
- `content_type`: The MIME type of the attachment file.
- `context`: The context in which the attachment is used.
- `is_commited`: A boolean indicating whether the attachment has been committed or is dangling.

### problem

- `id`: A unique UUIDv7 identifying the problem.
- `created_at`: The timestamp when the problem was created.
- `updated_at`: The timestamp when the problem was last updated.
- `deleted_at`: The timestamp when the problem was deleted, if applicable.
- `version`: The version number of the problem record, used for optimistic locking.
- `contest_id`: The UUIDv7 of the contest the problem is associated with.
- `letter`: The letter identifier of the problem within the contest.
- `color`: The hexadecimal color code associated with the problem.
- `title`: The title of the problem.
- `description_id`: The UUIDv7 of the description attachment associated with the problem.
- `time_limit_ms`: The time limit for the problem in milliseconds.
- `memory_limit_mb`: The memory limit for the problem in megabytes.
- `test_cases_id`: The UUIDv7 of the test cases attachment associated with the problem.

## Audit Tables

Every table in the database has a corresponding audit table that tracks changes to the records over time. The audit tables have the same columns as the original tables, with additional columns for the revision number (`rev`), the type of revision (`revtype`) and flags (`*_mod`) indicating whether a particular column was modified in that revision (only applicable to updatable columns).

### revinfo

- `rev`: The revision number of the change.
- `timestamp`: The timestamp when the revision was made.
- `member_id`: The UUIDv7 of the member who made the revision, if applicable.
- `ip`: The IP address from which the revision was made, if applicable.
- `trace_id`: The trace identifier associated with the revision, if applicable.

## Revisions

The database schema is controlled by Flyway, which manages database migrations and ensures that the schema is kept up-to-date with the application code. Each migration is versioned, and Flyway applies them in order to bring the database to the latest state. `flyway_schema_history` is the table that tracks the applied migrations.
