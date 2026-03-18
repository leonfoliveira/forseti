# Regression Tests

## Overview

End-to-end verification of a full contest lifecycle and core user flows (contest creation, members, problems, submissions, judging, tickets, clarifications, announcements, leaderboard, and contest control).

**Location:** `test/regression` (Playwright UI tests and fixtures)

**Primary runner:** Playwright (Node.js) executed against a full test composition of services (Docker Compose profiles: `infra`, `backend`, `webapp`).

## Quick local run

1. Build test composition and sandbox image:

```bash
docker compose -f deployment/development/docker-compose.yaml \
	--profile infra --profile backend --profile webapp build --progress=plain --pull

cd applications/backend/infrastructure/src/main/resources/sandboxes
docker build -f python312.Dockerfile -t forseti-sb-python312:latest .
```

2. Start the composition:

```bash
docker compose -f deployment/development/docker-compose.yaml \
	--profile infra --profile backend --profile webapp up -d --wait
```

3. Prepare CLI (Python 3.12 virtualenv used by workflows):

```bash
cd applications/cli
make setup
make build
```

4. Install and run regression tests:

```bash
cd test/regression
npm ci
npx playwright install --with-deps
npm run test
```

## What the tests verify

The main regression spec (`default.spec.ts`) covers a representative contest lifecycle. Verifications include:

- **Contest creation (CLI):** `root` uses the CLI to create a contest with a unique slug; test expects the contest to exist and be reachable at `/`.
- **Members:** Root adds `admin`, `staff`, `judge`, and `contestant` accounts via the settings UI; tests verify members appear in settings.
- **Wait page & theme toggle:** Contestants before start see the wait page; theme toggle is functional.
- **Announcements & Problems:** Admin creates an announcement and adds a problem (with files/time/memory limits); test checks announcement and problem list updates.
- **Contest start/force start:** Admin force-starts the contest; test asserts status `IN_PROGRESS` and UI updates for contestants.
- **Submissions:** Contestant submits solutions covering TLE, RE, MLE, WA, and AC; tests assert submissions and final verdicts in the submissions list.
- **Request print:** Contestant requests a submission print; system creates a print ticket visible in tickets list.
- **Leaderboard:** Test checks scoreboard rows/cells reflect accepted/wrong submissions and penalties.
- **Clarifications:** Contestant creates a clarification; judge answers and deletes clarifications; tests assert lifecycle of clarifications.
- **Judging actions:** Judge downloads submissions, inspects executions, changes verdicts and reruns; tests assert status transitions and execution results.
- **Tickets:** Staff views tickets and transitions statuses (`OPEN` → `IN_PROGRESS`); tests assert persistence of updates.
- **Freeze / Force end:** Admin freezes/unfreezes and force-ends the contest; test asserts final status `ENDED` and UI updates accordingly.

Each verification step checks both UI state and expected API-driven side-effects (list updates, status changes, and downloadable artifacts where applicable).

## CI Workflows

- Branch workflow: [/.github/workflows/regression-test-branch.yaml](.github/workflows/regression-test-branch.yaml)
	- Trigger: scheduled (`cron`) and manual (`workflow_dispatch`).
	- Runs on `ubuntu-latest` and performs: build of Docker composition, build of Python sandbox image, bring up services, set up Python & CLI, build CLI, set up Node.js, install test deps, install Playwright browsers, and run `npm run test` in `test/regression`.

- PR workflow: [/.github/workflows/regression-test-pr.yaml](.github/workflows/regression-test-pr.yaml)
	- Trigger: issue comment on PR containing `/regression` (permission check requires commenter to have `write` or `admin`).
	- Behavior: Reacts to the comment, checks permission, checks out PR head commit, runs the same build/start/test steps as branch workflow, and leaves a comment on the PR with pass/fail results.

## Triggering from PRs

Add a comment containing `/regression` on the pull request. Only repo collaborators with write/admin permissions can trigger the job; the workflow will react and run regression tests against the PR commit.

## Troubleshooting tips

- If Playwright fails to launch browsers: ensure `npx playwright install --with-deps` completed and the test environment has required libraries.
- If services fail to start: inspect Docker Compose profiles and logs:

```bash
docker compose -f deployment/development/docker-compose.yaml \
	--profile infra --profile backend --profile webapp logs --follow
```

- If tests fail intermittently: re-run locally while watching logs; intermittent failures are commonly caused by slow container startup or pending DB migrations.

## Where to look for related code

- Regression tests: `test/regression` (Playwright tests and fixtures)
- Branch workflow: [/.github/workflows/regression-test-branch.yaml](.github/workflows/regression-test-branch.yaml)
- PR workflow: [/.github/workflows/regression-test-pr.yaml](.github/workflows/regression-test-pr.yaml)
