# Domain

The Forseti Judge core domain implements a comprehensive programming contest management system using Domain-Driven Design principles. The domain is organized around contest lifecycle management, submission processing, real-time communication, and support ticketing, with proper auditing and soft-delete patterns throughout. 

## Key Features

- **Domain-Driven Architecture**: Rich domain entities with clear responsibilities and relationships
- **Audit Trail**: Complete change tracking using Hibernate Envers with modification flags
- **Soft Delete Pattern**: Logical deletion with `deletedAt` timestamps and SQL restrictions  
- **Optimistic Locking**: Version-based concurrency control to prevent data conflicts
- **Event-Driven Communication**: Spring ApplicationEvent-based domain events for loose coupling
- **Security Context**: Thread-local execution context for request tracing and authorization

## Entities

### BaseEntity

Abstract base class providing common properties for all domain entities.

**Properties:**

- `id` - `UUID` (Primary key, UUIDv7 format)
- `createdAt` - `OffsetDateTime` (Audit timestamp)
- `updatedAt` - `OffsetDateTime` (Audit timestamp)
- `deletedAt` - `OffsetDateTime` (Soft delete timestamp, nullable)
- `version` - `Long` (Optimistic locking version)

### Contest

Central entity representing a programming contest with all associated configuration.

**Properties:**

- `slug` - `String` (URL-friendly identifier, unique)
- `title` - `String` (Display name)  
- `languages` - `List<Submission.Language>` (Allowed programming languages)
- `startAt` - `OffsetDateTime` (Contest start time)
- `endAt` - `OffsetDateTime` (Contest end time)
- `autoFreezeAt` - `OffsetDateTime` (Automatic leaderboard freeze time, nullable)
- `frozenAt` - `OffsetDateTime` (Manual freeze timestamp, nullable)
- `settings` - `Settings` (Nested configuration object)

**Settings:**

- `isAutoJudgeEnabled` - `Boolean` (Enable automatic judging)
- `isClarificationEnabled` - `Boolean` (Allow clarification requests)
- `isSubmissionPrintTicketEnabled` - `Boolean` (Allow print request tickets)
- `isTechnicalSupportTicketEnabled` - `Boolean` (Enable technical support tickets)
- `isNonTechnicalSupportTicketEnabled` - `Boolean` (Enable non-technical support tickets)
- `isGuestEnabled` - `Boolean` (Allow guest access)

### Problem

Individual contest problem with resource constraints and test data.

**Properties:**

- `contest` - `Contest` (Associated contest)
- `letter` - `Char` (Problem identifier)
- `color` - `String` (UI color code, hex format #rrggbb)
- `title` - `String` (Problem name)
- `timeLimit` - `Int` (Execution time limit in milliseconds)
- `memoryLimit` - `Int` (Memory limit in megabytes)
- `description` - `Attachment` (Problem statement PDF file)
- `testCases` - `Attachment` (Input/output CSV file with test data)

### Member

Contest participant or staff member with role-based permissions.

**Properties:**

- `contest` - `Contest` (Associated contest)
- `type` - `Type` (Role enumeration)
- `name` - `String` (Display name)
- `login` - `String` (Authentication username)
- `password` - `String` (Hashed password)

**Type Enumeration:**

- `API` - API system user
- `AUTOJUDGE` - Auto judge system user
- `ROOT` - Root user
- `ADMIN` - Admin user
- `STAFF` - Staff member
- `JUDGE` - Judge user
- `CONTESTANT` - Contest participant
- `UNOFFICIAL_CONTESTANT` - Unofficial contest participant

### Submission

Code submission from a contest participant for automated or manual judging.

**Properties:**

- `member` - `Member` (Author of the submission)
- `problem` - `Problem` (Target problem)
- `language` - `Language` (Programming language used)
- `status` - `Status` (Processing state)
- `answer` - `Answer` (Final judgment result, nullable)
- `code` - `Attachment` (Source code file)

**Language Enumeration:**

- `CPP_17` - C++ 17
- `JAVA_21` - Java 21
- `PYTHON_312` - Python 3.12

**Status Enumeration:**

- `JUDGING` - Currently being evaluated
- `FAILED` - Error during auto judging
- `JUDGED` - Evaluation completed

**Answer Enumeration:**

- `ACCEPTED` - All test cases passed
- `WRONG_ANSWER` - Incorrect output produced
- `COMPILATION_ERROR` - Code failed to compile
- `RUNTIME_ERROR` - Program crashed during execution
- `TIME_LIMIT_EXCEEDED` - Execution timeout
- `MEMORY_LIMIT_EXCEEDED` - Memory usage exceeded limit

### Execution

Detailed auto judge test execution results for a submission with individual test case outcomes.

**Properties:**

- `submission` - `Submission` (Associated submission)
- `answer` - `Submission.Answer` (Overall execution result)
- `totalTestCases` - `Int` (Total number of test cases)
- `approvedTestCases` - `Int` (Number of passed test cases, nullable)
- `input` - `Attachment` (Test input data)
- `output` - `Attachment` (Program output data)

### FrozenSubmission

Snapshot of submission state at leaderboard freeze time.

**Properties:**

- Same as `Submission`

### Announcement

Message visible to all contest participants and guests.

**Properties:**

- `contest` - `Contest` (Target contest)
- `member` - `Member` (Announcement author)
- `text` - `String` (Message content)

### Clarification

Question and answer thread supporting hierarchical discussions.

**Properties:**

- `contest` - `Contest` (Target contest)
- `member` - `Member` (Author)
- `problem` - `Problem` (Related problem, nullable for general questions)
- `parent` - `Clarification` (Parent message for threading, nullable)
- `text` - `String` (Message content)

### Session

User authentication session with CSRF protection.

**Properties:**

- `member` - `Member` (Authenticated user)
- `csrfToken` - `UUID` (Cross-site request forgery token)
- `expiresAt` - `OffsetDateTime` (Session expiration time)

### Ticket

Abstract support request base with single table inheritance for type-specific behavior.

**Properties:**

- `contest` - `Contest` (Target contest)
- `member` - `Member` (Request author)
- `staff` - `Member` (Assigned staff member, nullable)
- `type` - `Type` (Support request type)
- `status` - `Status` (Processing state)
- `properties` - `String` (JSON-encoded type-specific data)

**Type Enumeration:**

- `SUBMISSION_PRINT` - Code printing request
- `TECHNICAL_SUPPORT` - Technical assistance
- `NON_TECHNICAL_SUPPORT` - General help

**Status Enumeration:**

- `OPEN` - Newly created
- `IN_PROGRESS` - Being handled by staff
- `RESOLVED` - Successfully completed
- `REJECTED` - Request denied

#### SubmissionPrintTicket

Request to print submission source code.

**Type-Specific Properties:**

- `submissionId` - `UUID` (Target submission identifier)
- `attachmentId` - `UUID` (Code attachment identifier)

#### TechnicalSupportTicket

Technical assistance request for system issues.

**Type-Specific Properties:**

- `description` - `String` (Issue description)

#### NonTechnicalSupportTicket

General assistance request for contest-related questions.

**Type-Specific Properties:**

- `description` - `String` (Request description)

### Attachment

File storage abstraction for various content types with access control.

**Properties:**

- `contest` - `Contest` (Associated contest)
- `member` - `Member` (File uploader)
- `filename` - `String` (Original filename)
- `contentType` - `String` (MIME type)
- `context` - `Context` (Access control context)
- `isCommitted` - `Boolean` (File persistence status)

**Context Enumeration:**

- `PROBLEM_DESCRIPTION` - Problem statement files
- `PROBLEM_TEST_CASES` - Test input/output data
- `SUBMISSION_CODE` - Source code files
- `EXECUTION_OUTPUT` - Program execution results

### Audit

With exception of `FrozenSubmission`, all entities are audited with Hibernate Envers for complete change tracking. The audit tables have the suffix `_AUD`, include additional columns for modification flags to indicate the type of change (addition, modification, deletion), and a `rev` foreign key to `SessionRevisionEntity`.

#### SessionRevisionEntity

Hibernate Envers audit entity for session change tracking.

**Properties:**

- `rev` - `Long` (Revision number)
- `timestamp` - `LocalDateTime` (Modification timestamp)
- `sessionId` - `UUID` (Associated session identifier, nullable)
- `ip` - `String` (Client IP address, nullable)
- `traceId` - `UUID` (Request correlation ID, nullable)

## Models

Non persistent data structures.

### Execution Context

Thread-local context for authorization and tracing.

**Properties:**

- `ip` - `String` (Client IP address)
- `traceId` - `UUID` (Request correlation ID)
- `contestId` - `UUID` (Current contest scope, nullable)
- `session` - `Session` (Authenticated session, nullable)
- `startedAt` - `OffsetDateTime` (Request start time)

### Leaderboard

Contest standings table with member rankings and problem-specific statistics.

**Properties:**

- `contestId` - `UUID` (Target contest)
- `issuedAt` - `OffsetDateTime` (Snapshot timestamp)
- `isFrozen` - `Boolean` (Freeze status)
- `rows` - `List<Row>` (Per-member statistics)

#### Row

Individual member's contest performance summary.

**Properties:**

- `memberId` - `UUID` (Participant identifier)
- `memberName` - `String` (Display name)
- `memberType` - `Member.Type` (Participant role)
- `score` - `Int` (Total solved problems)
- `penalty` - `Long` (Total penalty time in minutes)
- `cells` - `List<Cell>` (Per-problem statistics)

#### Cell

Member's performance on a specific problem.

**Properties:**

- `memberId` - `UUID` (Participant identifier)
- `problemId` - `UUID` (Problem identifier)
- `problemLetter` - `Char` (Problem display identifier)
- `problemColor` - `String` (UI color code)
- `isAccepted` - `Boolean` (Problem solved status)
- `acceptedAt` - `OffsetDateTime` (Solution timestamp, nullable)
- `wrongSubmissions` - `Int` (Failed attempt count)
- `penalty` - `Long` (Penalty time in minutes)

### AdminDashboard

Administrative view with complete contest visibility.

**Components:**

- `contest` - Contest details with members and problems
- `leaderboard` - Current standings
- `members` - All participants and staff
- `problems` - All contest problems
- `submissions` - All code submissions
- `clarifications` - All Q&A threads
- `announcements` - All broadcast messages
- `tickets` - All support requests
- `memberTickets` - Current user's tickets

### ContestantDashboard

Participant view with appropriate content filtering.

**Components:**

- `contest` - Basic contest information
- `leaderboard` - Public standings (respects freeze)
- `members` - Visible participants
- `problems` - Available problems
- `submissions` - All submissions (for scoreboard context)
- `memberSubmissions` - Current user's submissions only
- `clarifications` - Public Q&A threads
- `announcements` - Contest announcements
- `memberTickets` - Current user's support requests

### JudgeDashboard

Judge view for submission evaluation and clarification management.

**Components:**

- `contest` - Contest details
- `leaderboard` - Real-time standings (ignores freeze)
- `members` - All participants
- `problems` - All problems with test data access
- `submissions` - All submissions for judging
- `clarifications` - All clarifications for answering
- `announcements` - Contest announcements
- `memberTickets` - Current user's tickets

### StaffDashboard

Staff view for technical support and contest administration.

**Components:**

- `contest` - Contest details
- `leaderboard` - Real-time standings
- `members` - All participants and staff
- `problems` - All contest problems
- `submissions` - All code submissions
- `clarifications` - All Q&A threads
- `announcements` - Contest announcements
- `tickets` - All support requests for handling
- `memberTickets` - Current user's tickets

### GuestDashboard

Public view for non-authenticated users.

**Components:**

- `contest` - Basic contest information
- `leaderboard` - Public standings (respects freeze)
- `members` - Visible participants
- `problems` - Available problems
- `submissions` - Public submissions
- `clarifications` - Public clarifications
- `announcements` - Contest announcements

## Business Events

Domain events for loose coupling and reactive system behavior.

### AnnouncementEvent

Broadcast message events for notification systems.

**Event Types:**

- `Created(announcementId: UUID)` - New announcement published

### AttachmentsEvent

File management events (object singleton).

**Event Types:**

- `Uploaded(attachmentId: UUID)` - New file successfully uploaded

### ClarificationEvent

Communication events for real-time updates.

**Event Types:**

- `Created(clarificationId: UUID)` - New question or answer posted
- `Deleted(contestId: UUID, clarificationId: UUID)` - Message removed

### ContestEvent

Contest lifecycle events for external system integration.

**Event Types:**

- `Created(contestId: UUID)` - New contest established
- `Updated(contestId: UUID)` - Contest details modified
- `Deleted(contestId: UUID)` - Contest permanently removed

### ExecutionEvent

Test execution events for detailed result tracking.

**Event Types:**

- `Created(executionId: UUID)` - New execution result recorded

### LeaderboardEvent

Standings events for UI synchronization.

**Event Types:**  

- `Frozen(contestId: UUID)` - Leaderboard frozen manually
- `Unfrozen(contestId: UUID, frozenAt: OffsetDateTime)` - Leaderboard unfrozen

### SubmissionEvent  

Submission processing events for workflow coordination.

**Event Types:**

- `Created(submissionId: UUID)` - New submission received
- `Reset(submissionId: UUID)` - Submission reset for rejudging
- `Updated(submissionId: UUID)` - Judgment completed or modified

### TicketEvent

Support request events for staff notification.

**Event Types:**

- `Created(ticketId: UUID)` - New support request submitted
- `Updated(ticketId: UUID)` - Ticket status or assignment changed

## Exceptions

Domain-specific exception hierarchy for proper error handling and HTTP status mapping.

### BusinessException

Base class for business rule violations.

**Usage:** Validation errors, constraint violations, invalid state transitions

### ConflictException

Resource conflict errors.

**Usage:** Duplicate key violations, versioning conflicts, concurrent modification

### NotFoundException

Resource not found errors.

**Usage:** Invalid entity IDs, missing required relationships

### ForbiddenException

Permission denied errors.

**Usage:** Insufficient privileges, contest access restrictions

### UnauthorizedException

Authentication required errors.

**Usage:** Missing or invalid sessions, expired credentials

### InternalServerException

System errors.

**Usage:** Unexpected failures, external service errors, configuration issues
