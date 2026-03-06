# API

The Forseti API service is the main HTTP REST and WebSocket server that serves as the primary interface for all client interactions with the competitive programming judge platform. This Spring Boot application handles authentication, authorization, and real-time communication for contests.

## Key Features

- **Authentication & Authorization**: Cookie-based stateful session authentication with CSRF protection and contest-scoped authorization
- **REST API**: Comprehensive HTTP endpoints for managing contests, problems, submissions, clarifications, announcements, and tickets
- **Real-time Communication**: WebSocket server using Socket.io for live updates during contests using fan-out architecture with RabbitMQ as the message broker
- **Message Queue Integration**: Publishes submissions to `submission-queue` via RabbitMQ for auto-judging and consumes from `submission-failed-queue` for error handling
- **File Management**: Handles file uploads/downloads for problem descriptions, test cases, and submission code via MinIO integration
- **Role-based Access**: Supports different member types (ROOT, ADMIN, JUDGE, STAFF, CONTESTANT, UNOFFICIAL_CONTESTANT, GUEST) with appropriate permissions

## Response DTOs

Structures shared by HTTP endpoints responses, websocket events, and async events.

### Announcement

#### AnnouncementResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "member": "MemberResponseDTO",
  "text": "string",
  "version": "number"
}
```

### Attachment

#### AttachmentResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "filename": "string",
  "contentType": "string",
  "version": "number"
}
```

### Clarification

#### ClarificationResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "member": "MemberResponseDTO",
  "problem": "ProblemResponseDTO (optional)",
  "parentId": "string (optional)",
  "text": "string",
  "children": "ClarificationResponseDTO[]",
  "version": "number"
}
```

### Contest

#### ContestResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "slug": "string",
  "title": "string",
  "languages": "SubmissionLanguage[]",
  "startAt": "string (datetime)",
  "endAt": "string (datetime)",
  "autoFreezeAt": "string (datetime, optional)",
  "settings": {
    "isAutoJudgeEnabled": "boolean",
    "isClarificationEnabled": "boolean",
    "isSubmissionPrintTicketEnabled": "boolean",
    "isTechnicalSupportTicketEnabled": "boolean",
    "isNonTechnicalSupportTicketEnabled": "boolean",
    "isGuestEnabled": "boolean"
  },
  "version": "number"
}
```

#### ContestWithMembersAndProblemsDTO

```json
{
  // Extends ContestResponseDTO
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "slug": "string",
  "title": "string",
  "languages": "SubmissionLanguage[]",
  "startAt": "string (datetime)",
  "endAt": "string (datetime)",
  "autoFreezeAt": "string (datetime, optional)",
  "settings": {
    "isAutoJudgeEnabled": "boolean",
    "isClarificationEnabled": "boolean",
    "isSubmissionPrintTicketEnabled": "boolean",
    "isTechnicalSupportTicketEnabled": "boolean",
    "isNonTechnicalSupportTicketEnabled": "boolean",
    "isGuestEnabled": "boolean"
  },
  "version": "number",
  // Additional fields
  "members": "MemberWithLoginResponseDTO[]",
  "problems": "ProblemWithTestCasesResponseDTO[]"
}
```

### Dashboard

#### AdminDashboardResponseDTO

```json
{
  "contest": "ContestWithMembersAndProblemsDTO",
  "leaderboard": "LeaderboardResponseDTO",
  "members": "MemberWithLoginResponseDTO[]",
  "problems": "ProblemWithTestCasesResponseDTO[]",
  "submissions": "SubmissionWithCodeAndExecutionsResponseDTO[]",
  "clarifications": "ClarificationResponseDTO[]",
  "announcements": "AnnouncementResponseDTO[]",
  "tickets": "TicketResponseDTO[]",
  "memberTickets": "TicketResponseDTO[]"
}
```

#### ContestantDashboardResponseDTO

```json
{
  "contest": "ContestResponseDTO",
  "leaderboard": "LeaderboardResponseDTO",
  "members": "MemberResponseDTO[]",
  "problems": "ProblemResponseDTO[]",
  "submissions": "SubmissionResponseDTO[]",
  "memberSubmissions": "SubmissionWithCodeResponseDTO[]",
  "clarifications": "ClarificationResponseDTO[]",
  "announcements": "AnnouncementResponseDTO[]",
  "memberTickets": "TicketResponseDTO[]"
}
```

#### GuestDashboardResponseDTO

```json
{
  "contest": "ContestResponseDTO",
  "leaderboard": "LeaderboardResponseDTO",
  "members": "MemberResponseDTO[]",
  "problems": "ProblemResponseDTO[]",
  "submissions": "SubmissionResponseDTO[]",
  "clarifications": "ClarificationResponseDTO[]",
  "announcements": "AnnouncementResponseDTO[]"
}
```

#### JudgeDashboardResponseDTO

```json
{
  "contest": "ContestResponseDTO",
  "leaderboard": "LeaderboardResponseDTO",
  "members": "MemberResponseDTO[]",
  "problems": "ProblemWithTestCasesResponseDTO[]",
  "submissions": "SubmissionWithCodeAndExecutionsResponseDTO[]",
  "clarifications": "ClarificationResponseDTO[]",
  "announcements": "AnnouncementResponseDTO[]",
  "memberTickets": "TicketResponseDTO[]"
}
```

#### StaffDashboardResponseDTO

```json
{
  "contest": "ContestResponseDTO",
  "leaderboard": "LeaderboardResponseDTO",
  "members": "MemberResponseDTO[]",
  "problems": "ProblemResponseDTO[]",
  "submissions": "SubmissionResponseDTO[]",
  "clarifications": "ClarificationResponseDTO[]",
  "announcements": "AnnouncementResponseDTO[]",
  "tickets": "TicketResponseDTO[]",
  "memberTickets": "TicketResponseDTO[]"
}
```

### Error

#### ErrorResponseBodyDTO

```json
{
  "message": "string"
}
```

### Execution

#### ExecutionResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "answer": "SubmissionAnswer",
  "totalTestCases": "number",
  "lastTestCase": "number (optional)",
  "input": "AttachmentResponseDTO",
  "output": "AttachmentResponseDTO",
  "version": "number"
}
```

### Leaderboard

#### LeaderboardResponseDTO

```json
{
  "contestId": "string",
  "contestStartAt": "string (datetime)",
  "isFrozen": "boolean",
  "issuedAt": "string (datetime)",
  "rows": [
    {
      "memberId": "string",
      "memberName": "string",
      "memberType": "MemberType",
      "score": "number",
      "penalty": "number",
      "cells": [
        {
          "problemId": "string",
          "problemLetter": "string",
          "problemColor": "string",
          "isAccepted": "boolean",
          "acceptedAt": "string (datetime, optional)",
          "wrongSubmissions": "number",
          "penalty": "number"
        }
      ]
    }
  ]
}
```

#### LeaderboardCellResponseDTO

```json
{
  "memberId": "string",
  "problemId": "string",
  "problemLetter": "string",
  "problemColor": "string",
  "letter": "string",
  "isAccepted": "boolean",
  "acceptedAt": "string (datetime, optional)",
  "wrongSubmissions": "number",
  "penalty": "number"
}
```

### Member

#### MemberResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "contestId": "string (optional)",
  "type": "MemberType",
  "name": "string",
  "version": "number"
}
```

#### MemberWithLoginResponseDTO

```json
{
  // Extends MemberResponseDTO
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "contestId": "string (optional)",
  "type": "MemberType",
  "name": "string",
  "version": "number",
  // Additional field
  "login": "string"
}
```

### Problem

#### ProblemResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "letter": "string",
  "color": "string",
  "title": "string",
  "description": "AttachmentResponseDTO",
  "timeLimit": "number",
  "memoryLimit": "number",
  "version": "number"
}
```

#### ProblemWithTestCasesResponseDTO

```json
{
  // Extends ProblemResponseDTO
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "letter": "string",
  "color": "string",
  "title": "string",
  "description": "AttachmentResponseDTO",
  "timeLimit": "number",
  "memoryLimit": "number",
  "version": "number",
  // Additional field
  "testCases": "AttachmentResponseDTO"
}
```

### Session

#### SessionResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "member": "MemberResponseDTO",
  "expiresAt": "string (datetime)",
  "version": "number"
}
```

### Submission

#### SubmissionResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "problem": "ProblemResponseDTO",
  "member": "MemberResponseDTO",
  "language": "SubmissionLanguage",
  "status": "SubmissionStatus",
  "answer": "SubmissionAnswer (optional)",
  "version": "number"
}
```

#### SubmissionWithCodeResponseDTO

```json
{
  // Extends SubmissionResponseDTO
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "problem": "ProblemResponseDTO",
  "member": "MemberResponseDTO",
  "language": "SubmissionLanguage",
  "status": "SubmissionStatus",
  "answer": "SubmissionAnswer (optional)",
  "version": "number",
  // Additional field
  "code": "AttachmentResponseDTO"
}
```

#### SubmissionWithCodeAndExecutionsResponseDTO

```json
{
  // Extends SubmissionWithCodeResponseDTO
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "problem": "ProblemResponseDTO",
  "member": "MemberResponseDTO",
  "language": "SubmissionLanguage",
  "status": "SubmissionStatus",
  "answer": "SubmissionAnswer (optional)",
  "version": "number",
  "code": "AttachmentResponseDTO",
  // Additional field
  "executions": "ExecutionResponseDTO[]"
}
```

### Ticket

#### TicketResponseDTO

```json
{
  "id": "string (uuidv7)",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "version": "number",
  "member": "MemberResponseDTO",
  "staff": "MemberResponseDTO (optional)",
  "status": "TicketStatus",
  "type": "TicketType",
  "properties": "object (varies by type)"
}
```

##### TicketResponseDTO Type Variants

**SUBMISSION_PRINT Ticket:**
```json
{
  "type": "SUBMISSION_PRINT",
  "properties": {
    "submissionId": "string",
    "attachmentId": "string"
  }
}
```

**TECHNICAL_SUPPORT Ticket:**
```json
{
  "type": "TECHNICAL_SUPPORT", 
  "properties": {
    "description": "string"
  }
}
```

**NON_TECHNICAL_SUPPORT Ticket:**
```json
{
  "type": "NON_TECHNICAL_SUPPORT",
  "properties": {
    "description": "string"
  }
}
```

## HTTP

Rest controller endpoints for handling HTTP requests from clients, including authentication, contest management, problem management, submission handling, clarification handling, announcement handling, ticket handling, and file uploads/downloads.

### Authentication

Forseti uses cookie-based stateful session authentication with CSRF protection and contest-scoped authorization. The HTTP authentication flow involves some steps:

#### 1. Session Cookie Extraction

Authentication is handled by the `HttpAuthenticationInterceptor` which:

1. **Extracts `sessionId` from cookie `session_id`**
    - If no session cookie is found or its value is blank, the request continues as a guest (public endpoints remain accessible)
    - If the cookie value is an invalid UUID format, return `401`
2. **Retrive session from cache or database using `sessionId`**
    - If it is expired, delete the session and return `401`

#### 2. CSRF Token Validation

For state-changing operations (non-GET or authentication requests), CSRF protection is enforced:

1. **Extracts `csrfToken` from header `x-csrf-token`**
    - If the value does not match the stored value in the session, return `403`

#### 3. Contest ID Validation

For contest-scoped routes (`/v1/contests/{contestId}/...`):

1. **Extracts `contestId` from path**
    - If the session member is not `ROOT` and their `contestId` does not match path `contestId`, continue as guest

#### 4. Private Route Enforcement

Private route access is enforced by the `HttpPrivateInterceptor` which:

1. **Read `@Private` annotation from the controller method**
    - If there is no annotation, allow access
    - Otherwise, check if session member type is included in the annotation list

### Endpoints

#### Root (`/v1/root`)

##### Authentication

###### Authenticate as Root

Creates a new session for a `ROOT` member if the provided password is correct. All active sessions for the member will be revoked before creating the new session.

- **POST** `/v1/root:sign-in`
- **Access:** Public
- **Request Body:** `AuthenticateRootRequestBodyDTO`
```json
{
  "password": "string"
}
```
- **Response Body:** [SessionResponseDTO](#sessionresponsedto)
- **Response Cookies:**
    - `session_id`: Set to the new session ID
    - `csrf_token`: Set to the new CSRF token for the session

###### Create Contest

Creates a new contest with the provided details. The contest is initially created without members or problems and with a very later start time, these values should be updated later using the update contest endpoint.

- **POST** `/v1/root/contests`
- **Access:** ROOT
- **Request Body:** `CreateContestRequestBodyDTO`
```json
{
  "slug": "string",
  "title": "string",
  "languages": ["SubmissionLanguage"],
  "startAt": "string (datetime)",
  "endAt": "string (datetime)"
}
```
- **Response Body:** [ContestResponseDTO](#contestresponsedto)

###### List All Contests

List all contests in the system, including their basic details but without members or problems. This endpoint is mainly for administrative purposes.

- **GET** `/v1/root/contests`
- **Access:** ROOT
- **Response Body:** Array of [ContestResponseDTO](#contestresponsedto)

###### Delete Contest

Delete a contest and all its related data (members, problems, submissions, etc.) permanently from the system. The contest must not have started yet (current time is before `startAt`).

- **DELETE** `/v1/root/contests/{contestId}`
- **Access:** ROOT
- **Response Body:** No content

#### Contest (`/v1/contests/{contestId}`)

##### Authentication

###### Authenticate to Contest

Creates a new session for a contest member if the provided login and password are correct. The member must belong to the contest specified by `contestId` in the path. All active sessions for the member will be revoked before creating the new session.

- **POST** `/v1/contests/{contestId}:sign-in`
- **Access:** Public
- **Request Body:** `AuthenticateToContestRequestBodyDTO`
```json
{
  "login": "string",
  "password": "string"
}
```
- **Response Body:** [SessionResponseDTO](#sessionresponsedto)
- **Response Cookies:**
    - `session_id`: Set to the new session ID
    - `csrf_token`: Set to the new CSRF token for the session

##### Contests

###### Update Contest

Update contest details, members, and problems. This endpoint can be used to set the actual start time, add members and problems after the initial creation, or update any other contest details. The contest must not have ended yet (current time is before `endAt`). **Use with caution if the contest has already started, as it may affect the members experience.**

- **PUT** `/v1/contests/{contestId}`
- **Access:** ROOT, ADMIN
- **Request Body:** `UpdateContestRequestBodyDTO`
```json
{
  "slug": "string",
  "title": "string",
  "languages": ["SubmissionLanguage"],
  "startAt": "string (datetime)",
  "endAt": "string (datetime)",
  "autoFreezeAt": "string (datetime, optional)",
  "settings": {
    "isAutoJudgeEnabled": "boolean",
    "isClarificationEnabled": "boolean",
    "isSubmissionPrintTicketEnabled": "boolean",
    "isTechnicalSupportTicketEnabled": "boolean",
    "isNonTechnicalSupportTicketEnabled": "boolean",
    "isGuestEnabled": "boolean"
  },
  "members": [
    {
      "type": "MemberType",
      "name": "string",
      "login": "string",
      "password": "string"
    }
  ],
  "problems": [
    {
      "letter": "string",
      "color": "string",
      "title": "string",
      "timeLimit": "number",
      "memoryLimit": "number",
      "description": {
        "id": "string (uuidv7)"
      },
      "testCases": {
        "id": "string (uuidv7)"
      }
    }
  ]
}
```
- **Response Body:** [ContestWithMembersAndProblemsDTO](#contestwithmembersandproblemsdto)

###### Force Start Contest

Update the contest start time to the current time, effectively starting the contest immediately. This can be used in emergency situations where the contest needs to be started manually regardless of the originally scheduled start time. The contest must not have ended yet (current time is before `endAt`). **Use with extreme caution as it will affect all members experience and may cause confusion if not communicated properly.**

- **PUT** `/v1/contests/{contestId}:force-start`
- **Access:** ROOT, ADMIN
- **Response Body:** [ContestWithMembersAndProblemsDTO](#contestwithmembersandproblemsdto)

###### Force End Contest

Update the contest end time to the current time, effectively ending the contest immediately. This can be used in emergency situations where the contest needs to be ended manually regardless of the originally scheduled end time. The contest must have already started (current time is after `startAt`). **Use with extreme caution as it will affect all members experience and may cause confusion if not communicated properly.**

- **PUT** `/v1/contests/{contestId}:force-end`
- **Access:** ROOT, ADMIN
- **Response Body:** [ContestWithMembersAndProblemsDTO](#contestwithmembersandproblemsdto)

##### Dashboards

###### Admin Dashboard

Fetches an aggregation of all relevant contest data for administrative users.

- **GET** `/v1/contests/{contestId}/dashboard/admin`
- **Access:** ROOT, ADMIN
- **Response Body:** [AdminDashboardResponseDTO](#admindashboardresponsedto)

##### Contestant Dashboard

Fetches an aggregation of contest data relevant to contestants.

- **GET** `/v1/contests/{contestId}/dashboard/contestant`
- **Access:** CONTESTANT, UNOFFICIAL_CONTESTANT
- **Response Body:** [ContestantDashboardResponseDTO](#contestantdashboardresponsedto)

##### Judge Dashboard

Fetches an aggregation of contest data relevant to judges.

- **GET** `/v1/contests/{contestId}/dashboard/judge`
- **Access:** JUDGE
- **Response Body:** [JudgeDashboardResponseDTO](#judgedashboardresponsedto)

##### Staff Dashboard

Fetches an aggregation of contest data relevant to staff members.

- **GET** `/v1/contests/{contestId}/dashboard/staff`
- **Access:** STAFF
- **Response Body:** [StaffDashboardResponseDTO](#staffdashboardresponsedto)

##### Guest Dashboard

Fetches an aggregation of contest data relevant to guests (unauthorized members). This is for contests that have `isGuestEnabled` set to true.

- **GET** `/v1/contests/{contestId}/dashboard/guest`
- **Access:** Public
- **Response Body:** [GuestDashboardResponseDTO](#guestdashboardresponsedto)

##### Leaderboard

###### Get Leaderboard (Admin View)

Get the current state of the leaderboard with all details, bypassing freeze restrictions. This endpoint is intended for administrative users who need to see the real-time leaderboard regardless of freeze status.

- **GET** `/v1/contests/{contestId}/leaderboard`
- **Access:** ROOT, ADMIN
- **Response Body:** [LeaderboardResponseDTO](#leaderboardresponsedto)
- **Note:** Bypasses freeze restrictions

###### Freeze Leaderboard

Freeze the leaderboard, preventing contestants from seeing updates on other members' submissions and the overall leaderboard changes.

- **PUT** `/v1/contests/{contestId}/leaderboard:freeze`
- **Access:** ROOT, ADMIN
- **Response Body:** [ContestWithMembersAndProblemsDTO](#contestwithmembersandproblemsdto)

###### Unfreeze Leaderboard

Unfreeze the leaderboard, allowing contestants to see the latest updates on other members' submissions and the overall leaderboard changes.

- **PUT** `/v1/contests/{contestId}/leaderboard:unfreeze`
- **Access:** ROOT, ADMIN
- **Response Body:** [ContestWithMembersAndProblemsDTO](#contestwithmembersandproblemsdto)

##### Announcements

###### Create Announcement

Create a new announcement for the contest. Announcements are visible to all members and guests of the contest and are typically used for important notifications or updates during the contest.

- **POST** `/v1/contests/{contestId}/announcements`
- **Access:** ROOT, ADMIN
- **Request Body:** `CreateAnnouncementRequestBodyDTO`
```json
{
  "text": "string"
}
```
- **Response Body:** [AnnouncementResponseDTO](#announcementresponsedto)

##### Clarifications

###### Create Clarification

Create a new clarification request for a specific problem or as a follow-up to an existing clarification. Clarifications are used by contestants to ask questions about the problems or contest rules, and by judges to provide answers. The `problemId` is optional, allowing for general clarifications that are not tied to a specific problem. The `parentId` is also optional and indicated if this clarification is a follow-up to an existing clarification.

- **Access:** ROOT, ADMIN, JUDGE, CONTESTANT, UNOFFICIAL_CONTESTANT
- **Request Body:** `CreateClarificationRequestBodyDTO`
```json
{
  "problemId": "string (uuidv7, optional)",
  "parentId": "string (uuidv7, optional)",
  "text": "string"
}
```
- **Response Body:** [ClarificationResponseDTO](#clarificationresponsedto)

###### Delete Clarification

Delete a clarification and all its child clarifications permanently from the system. This can be used to remove inappropriate clarifications from the contest.

- **DELETE** `/v1/contests/{contestId}/clarifications/{clarificationId}`
- **Access:** ROOT, ADMIN, JUDGE
- **Response Body:** No content

##### Submissions

###### Create Submission

Create a new submission for a specific problem. The submission includes the problem being solved, the programming language used, and the code attachment. The submission will be added to `submission-queue` if `isAutoJudgeEnabled` is true for the contest.

- **POST** `/v1/contests/{contestId}/submissions`
- **Access:** CONTESTANT, UNOFFICIAL_CONTESTANT
- **Request Body:** `CreateSubmissionRequestBodyDTO`
```json
{
  "problemId": "string (uuidv7)",
  "language": "SubmissionLanguage",
  "code": {
    "id": "string (uuidv7)"
  }
}
```
- **Response Body:** [SubmissionWithCodeResponseDTO](#submissionwithcoderesponsedto)

###### Rerun Submission

Reset a submission's status to `PENDING`, clear its answer and re-add it to the `submission-queue` for rejudging. This can be used by judges to manually trigger a rejudge of a submission, for example after clarifying a problem statement or fixing an issue with the test cases.

- **PUT** `/v1/contests/{contestId}/submissions/{submissionId}:rerun`
- **Access:** ROOT, ADMIN, JUDGE
- **Response Body:** [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)

###### Update Submission Answer

Manually update a submission's answer and set its status to `JUDGED`. This can be used by judges to manually provide an answer for a submission, for example in cases where the automatic judging system has failed, is disabled, or when a manual override is necessary due to special circumstances.

- **PUT** `/v1/contests/{contestId}/submissions/{submissionId}:update-answer`
- **Access:** ROOT, ADMIN, JUDGE
- **Request Body:** `UpdateAnswerSubmissionRequestBodyDTO`
```json
{
  "answer": "SubmissionAnswer"
}
```
- **Response Body:** [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)

##### Attachments

###### Upload Attachment

Upload a new attachment file for the contest. Attachments can be used for various purposes such as problem descriptions, test cases, or submission code. The `context` parameter can be used to specify the intended use of the attachment (e.g., "problem-description", "test-cases", "submission-code"), which is used for access control.

- **POST** `/v1/contests/{contestId}/attachments`
- **Access:** ROOT, ADMIN, STAFF, JUDGE, CONTESTANT, UNOFFICIAL_CONTESTANT
- **Request:** Multipart file upload with `context` parameter
- **Response Body:** [AttachmentResponseDTO](#attachmentresponsedto)

###### Download Attachment

Download an attachment file by its ID. Access to the attachment is determined by its context and the member's permissions. For example, a submission code attachment can only be accessed by the submission owner, judges, staff, admins, and root, while a problem description attachment can be accessed by all members and guests.

- **GET** `/v1/contests/{contestId}/attachments/{attachmentId}`
- **Access:** Context-dependent
- **Response Body:** File download with appropriate headers

##### Tickets

###### Create Ticket

Create a new support ticket for the contest. Tickets can be of different types (e.g., submission print, technical support, non-technical support) and have type-specific properties. The ticket will be visible to staff members and admins, while the ticket creator can view their own tickets.

- **POST** `/v1/contests/{contestId}/tickets`
- **Access:** ROOT, ADMIN, STAFF, JUDGE, CONTESTANT, UNOFFICIAL_CONTESTANT
- **Request Body:** `CreateTicketRequestBodyDTO`
```json
{
  "type": "TicketType",
  "properties": "object (varies by type)"
}
```
**Type-specific examples:**

*SUBMISSION_PRINT:*
```json
{
  "type": "SUBMISSION_PRINT",
  "properties": {
    "submissionId": "string (uuidv7)",
    "attachmentId": "string (uuidv7)"
  }
}
```

*TECHNICAL_SUPPORT:*
```json
{
  "type": "TECHNICAL_SUPPORT",
  "properties": {
    "description": "string"
  }
}
```

*NON_TECHNICAL_SUPPORT:*
```json
{
  "type": "NON_TECHNICAL_SUPPORT",
  "properties": {
    "description": "string"
  }
}
```
- **Response Body:** [TicketResponseDTO](#ticketresponsedto)

###### Update Ticket Status

Update the status of a ticket (e.g., from OPEN to RESOLVED). This can be used by staff members and admins to manage support tickets.

- **PUT** `/v1/contests/{contestId}/tickets/{ticketId}:update-status`
- **Access:** ROOT, ADMIN, STAFF
- **Request Body:** `UpdateTicketStatusRequestBodyDTO`
```json
{
  "status": "TicketStatus"
}
```
- **Response Body:** [TicketResponseDTO](#ticketresponsedto)

#### Public (`/v1/public`)

##### Contests

###### Get Contest by Slug

Fetch basic contest details by its slug. This endpoint is intended for public access, allowing users to query the contest ID and other basic informations before attempting any other operations.

- **GET** `/v1/public/contests/slug/{slug}`
- **Access:** Public
- **Response Body:** [ContestResponseDTO](#contestresponsedto)

#### Session (`/v1/sessions`)

##### Sessions

###### Get Current Session

Fetch the current authenticated session details. This can be used by clients to retrieve information about the session with ID stored in cookies, such as member type and contest ID.

- **GET** `/v1/sessions/me`
- **Access:** Any authenticated user
- **Response Body:** [SessionResponseDTO](#sessionresponsedto)

###### Get Grafana Credentials

Fetch `x-webauth-user` and `x-webauth-name` headers from the current session for Grafana authentication. This endpoint is used by traefik to authenticate users accessing Grafana dashboards, allowing for single sign-on (SSO) functionality.

- **GET** `/v1/sessions/grafana`
- **Access:** ROOT, ADMIN or STAFF
- **Response Headers:**
  - `x-webauth-user`: `{user.id}@{contestId}` for contest members or `{user.id}` for the ROOT user
  - `x-webauth-name`: Full name of the authenticated user
  
###### Delete Current Session (Logout)

Revoke all sessions for the current member, effectively logging them out from all devices. This is a security measure to ensure that if a session is compromised, the user can invalidate all sessions immediately.

- **DELETE** `/v1/sessions/me`
- **Access:** Any authenticated user
- **Response Body:** No content
- **Response Cookies:** Clears session and CSRF cookies

#### Others

##### Ping
- **GET** `/ping`
- **Access:** Public
- **Response Body:** Plain text "pong"

##### Healthcheck
- **GET** `/actuator/health`
- **Access:** Only inside the docker network
- **Response Body:** JSON object with health status

##### Metrics
- **GET** `/metrics`
- **Access:** Only inside the docker network
- **Response Body:** Prometheus metrics in plain text format

### Error Responses

All endpoints may return error responses in the following format:

**Status Codes:**

- `400` Bad Request - Validation errors, malformed requests
- `401` Unauthorized - Authentication required, expired or revoked
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Business rule violations
- `500` Internal Server Error - Unexpected server errors

**Error Response Format:**
[ErrorResponseBodyDTO](#errorresponsebodydto)

## WebSocket

Socket.io listeners and topics for real-time updates to clients.

### Authentication

Forseti uses cookie-based stateful session authentication to restrict room subscription. The WebSocket authentication flow involves some steps:

#### 1. Session Cookie Extraction

Authentication is handled by the `SocketIOAuthenticateListener` and `SocketIOJoinListener`:

1. **Extracts `sessionId` from cookie `session_id` on `authenticate` event**
    - If no session cookie is found or its value is blank, the request continues as a guest (public rooms remain accessible)
    - If the cookie value is an invalid UUID format, send `error` event and disconnect
2. **Retrive session from cache or database using `sessionId`**
    - If it is expired, delete the session, send `error` event and disconnect
    - Otherwise, send `ready` event to acknowledge successful authentication (with or without session)

#### 2. Contest ID Validation

For contest-scoped rooms (`/contests/{contestId}/...`):

1. **Extracts `contestId` from room name**
    - If the session member is not `ROOT` and their `contestId` does not match room `contestId`, continue as guest

#### 4. Private Room Enforcement

Private room access is enforced by the `SocketIORoomAuthorizers` which:

1. **Runs member type and contest state validations based on room pattern**
    - If any validation fails, send `error` event
    - Otherwise, join client in room and send `joined` event

### Listeners

#### Authentication

Authenticate the socket connection using the session cookie. This is the first event that must be emitted by the client after establishing the WebSocket connection. The server will validate the session and authenticate the user before allowing them to subscribe to any rooms or receive any events.

- **Event:** `authenticate`
- **Purpose:** Authenticates clients using session cookies
- **Request Data:** No data
- **Response Events:**
  - `ready` - Authentication successful (with or without session)
  - `error` - Authentication failed or invalid session

#### Room Subscription

Subscribe authenticated clients to specific topic rooms based on their contest ID and member type. Clients must emit this event after successful authentication to start receiving real-time updates for the contest they are associated with.

- **Event:** `join`
- **Purpose:** Subscribes clients to specific topic rooms
- **Request Data:** String (room name)
- **Response Events:**
  - `joined` - Successfully subscribed to room
  - `error` - Authorization failed or room not found

#### Synchronization

Fetch missed events for clients that may have been disconnected temporarily. Clients can emit this event with a timestamp to retrieve all events that occurred since that time, ensuring they are up-to-date with the latest contest information. Events are store in cache, so this is not intended for long-term synchronization but rather for short disconnections.

- **Event:** `sync`  
- **Purpose:** Retrieves missed events since a specific timestamp
- **Request Data:**
```json
{
  "room": "string (room name)",
  "timestamp": "string (ISO datetime)"
}
```
- **Response Events:**
  - `sync_complete` - All missed events have been sent
  - `error` - Invalid payload or not authorized for room

#### Ping/Pong

- **Event:** `ping`
- **Purpose:** Health check and connection keep-alive
- **Request Data:** No data
- **Response Events:**
  - `pong` - Immediate response to confirm connectivity

### Topics

#### Dashboard

##### Admin Dashboard

Emits real-time updates for administrative users. This includes all relevant events such as announcements, clarifications, leaderboard updates, submissions, and tickets.

- **Topic Pattern:** `/contests/{contestId}/dashboard/admin`
- **Access:** ROOT, ADMIN
- **Events:**
  - `ANNOUNCEMENT_CREATED` → [AnnouncementResponseDTO](#announcementresponsedto)
  - `CLARIFICATION_CREATED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `CLARIFICATION_DELETED` → `{ "clarificationId": "string (uuidv7)" }`
  - `LEADERBOARD_UPDATED` → [LeaderboardCellResponseDTO](#leaderboardcellresponsedto)
  - `LEADERBOARD_FROZEN` → No data
  - `LEADERBOARD_UNFROZEN` → [LeaderboardResponseDTO](#leaderboardresponsedto)
  - `SUBMISSION_CREATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `TICKET_CREATED` → [TicketResponseDTO](#ticketresponsedto)
  - `TICKET_UPDATED` → [TicketResponseDTO](#ticketresponsedto)

##### Contestant Dashboard

Emits real-time updates for contestants. This includes events that are relevant to contestants such as announcements, clarifications, leaderboard updates, and their own submissions.

- **Topic Pattern:** `/contests/{contestId}/dashboard/contestant`
- **Access:** CONTESTANT, UNOFFICIAL_CONTESTANT  
- **Events:**
  - `ANNOUNCEMENT_CREATED` → [AnnouncementResponseDTO](#announcementresponsedto)
  - `CLARIFICATION_CREATED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `CLARIFICATION_DELETED` → `{ "clarificationId": "string (uuidv7)" }`
  - `LEADERBOARD_UPDATED` → [LeaderboardCellResponseDTO](#leaderboardcellresponsedto)
  - `LEADERBOARD_FROZEN` → No data
  - `LEADERBOARD_UNFROZEN` →
```json
{
    "leaderboard": "LeaderboardResponseDTO",
    "frozenSubmissions": "SubmissionResponseDTO[]"
}
```
  - `SUBMISSION_CREATED` → [SubmissionResponseDTO](#submissionresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionResponseDTO](#submissionresponsedto)

##### Judge Dashboard  

Emits real-time updates for judges. This includes events that are relevant to judges such as announcements, clarifications, leaderboard updates, and all submissions.

- **Topic Pattern:** `/contests/{contestId}/dashboard/judge`
- **Access:** JUDGE
- **Events:**
  - `ANNOUNCEMENT_CREATED` → [AnnouncementResponseDTO](#announcementresponsedto)
  - `CLARIFICATION_CREATED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `CLARIFICATION_DELETED` → `{ "clarificationId": "string (uuidv7)" }`
  - `LEADERBOARD_UPDATED` → [LeaderboardCellResponseDTO](#leaderboardcellresponsedto)
  - `LEADERBOARD_FROZEN` → No data
  - `LEADERBOARD_UNFROZEN` → [LeaderboardResponseDTO](#leaderboardresponsedto)
  - `SUBMISSION_CREATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)

##### Staff Dashboard

Emits real-time updates for staff members. This includes events that are relevant to staff such as announcements, clarifications, leaderboard updates, submissions, and tickets.

- **Topic Pattern:** `/contests/{contestId}/dashboard/staff`
- **Access:** STAFF
- **Events:**
  - `ANNOUNCEMENT_CREATED` → [AnnouncementResponseDTO](#announcementresponsedto)
  - `CLARIFICATION_CREATED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `CLARIFICATION_DELETED` → `{ "clarificationId": "string (uuidv7)" }`
  - `LEADERBOARD_UPDATED` → [LeaderboardCellResponseDTO](#leaderboardcellresponsedto)
  - `LEADERBOARD_FROZEN` → No data
  - `LEADERBOARD_UNFROZEN` → [LeaderboardResponseDTO](#leaderboardresponsedto)
  - `SUBMISSION_CREATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `TICKET_CREATED` → [TicketResponseDTO](#ticketresponsedto)
  - `TICKET_UPDATED` → [TicketResponseDTO](#ticketresponsedto)

##### Guest Dashboard

Emits real-time updates for guests on the guest dashboard. This includes events that are relevant to guests such as announcements, clarifications, and leaderboard updates.

- **Topic Pattern:** `/contests/{contestId}/dashboard/guest`
- **Access:** Public
- **Events:**
  - `ANNOUNCEMENT_CREATED` → [AnnouncementResponseDTO](#announcementresponsedto)
  - `CLARIFICATION_CREATED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `CLARIFICATION_DELETED` → `{ "clarificationId": "string (uuidv7)" }`
  - `LEADERBOARD_UPDATED` → [LeaderboardCellResponseDTO](#leaderboardcellresponsedto)
  - `LEADERBOARD_FROZEN` → No data
  - `LEADERBOARD_UNFROZEN` →
```json
{
    "leaderboard": "LeaderboardResponseDTO", 
    "frozenSubmissions": "SubmissionResponseDTO[]"
}
```
  - `SUBMISSION_CREATED` → [SubmissionResponseDTO](#submissionresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionResponseDTO](#submissionresponsedto)

#### Private

##### Contestant Private Channel

Emits real-time updates for contestants that are only relevant to themselves. This includes events such as clarifications and submission updates that should only be visible to the member who created them.

- **Topic Pattern:** `/contests/{contestId}/members/{memberId}/private/contestant`
- **Access:** Member with matching memberId only
- **Events:**
  - `CLARIFICATION_ANSWERED` → [ClarificationResponseDTO](#clarificationresponsedto)
  - `SUBMISSION_UPDATED` → [SubmissionWithCodeAndExecutionsResponseDTO](#submissionwithcodeandexecutionsresponsedto)
  - `TICKET_UPDATED` → [TicketResponseDTO](#ticketresponsedto)

##### Judge Private Channel

Emits real-time updates for judges that are only relevant to themselves. This includes events such as ticket updates that should only be visible to the member who created them or the staff member assigned to them.

- **Topic Pattern:** `/contests/{contestId}/members/{memberId}/private/judge`
- **Access:** Member with matching memberId only
- **Events:**
  - `TICKET_UPDATED` → [TicketResponseDTO](#ticketresponsedto)

## Queue Consumers

Consumers handles messages from rabbitmq queues.

#### Failed Submission

Handles submissions that failed during auto judge processing and updates their status to `FAILED` with appropriate error messages. This ensures `JUDGE` members are notified to judge them manually.

- **Queue**: `submission-failed-queue`
- **DLQ**: `submission-dlq`
- **Body**:
```json
{
  "submissionId": "string (uuidv7)",
}
```

#### Socket.io Fanout

Handle events that need to be broadcasted to WebSocket clients. This ensures members connected to any API replica receive these events.

- **Queue**: Temporary queue created on application start
- **Body**:
```json
{
  "room": "string (room name)",
  "name": "string (event name)",
  "data": "object (event data)"
}
```

## Jobs

Jobs are scheduled Quartz tasks that run periodically or at specific times to perform maintenance or automated actions.

#### Attachment Bucket Cleaner

Periodically cleans up uncommitted attachments from the storage bucket to save space. It is schedule on application start.

- **Schedule**: 24h after application start, then every 24h
- **Payload**: No payload

#### Auto Freeze

Automatically freezes the leaderboard at the contest's `autoFreezeAt` time. It is schedule on contest update. It is not scheduled on contest creation because contests cannot be created with `autoFreezeAt` defined.

- **Schedule**: On every contest's `autoFreezeAt` time
- **Payload**:
```json
{
  "contestId": "string (uuidv7)"
}
```