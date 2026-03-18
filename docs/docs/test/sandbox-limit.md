# Sandbox Limit Tests

## Overview

This page documents the `sandbox-limit` load test utility used to detect approximate time-limit (TLE) and memory-limit (MLE) thresholds for each supported language by submitting increasingly expensive programs until they stop being `ACCEPTED`.

## Location

- **Runner script:** `test/load/sandbox-limit/index.ts`
- **Runners:** `test/load/sandbox-limit/runner/` (per-language runner implementations)
- **Example output:** `test/load/.out` (captured when running the script locally)

## How it works (high level)

1. The script boots a small contest via the HTTP API (uses `ApiClient`) and creates a contestant and a single problem.
2. For each language runner (CPP_17, JAVA_21, PYTHON_312, NODE_22) the script runs two loops:
   - Time tests: repeatedly build a CPU-heavy program via `buildTimeLimitCodeFile(power)`, submit, poll until `JUDGED`, and record `maxCpuTime` / `maxClockTime`. The first non-`ACCEPTED` verdict indicates the observed TLE threshold.
   - Memory tests: repeatedly build a memory-heavy program via `buildMemoryLimitCodeFile(power)`, submit, poll until `JUDGED`, and record `maxPeakMemory`. The first non-`ACCEPTED` verdict indicates the observed MLE threshold.

## Running locally

Prerequisites: the API and dependent services must be running (same composition used by regression tests). Typical local run:

```bash
# Build the test composition and sandbox image (same as regression workflow)
docker compose -f deployment/development/docker-compose.yaml \
  --profile infra --profile backend --profile webapp build --progress=plain --pull

cd applications/backend/infrastructure/src/main/resources/sandboxes
docker build -f python312.Dockerfile -t forseti-sb-python312:latest .

# Start services
docker compose -f deployment/development/docker-compose.yaml \
  --profile infra --profile backend --profile webapp up -d --wait

# Run the sandbox-limit script (from repository root)
cd test/load
# Environment: API_URL (optional, default http://localhost:8080), ROOT_PASSWORD (optional)
npm run sandbox-limit
```

## Interpreting output

- Per-language TLE pass/fail lines appear as: `[LANG][TLE] Power: X => ANSWER, Max CPU Time: Y ms, Max Clock Time: Z ms`.
- After each language loop the runner prints a `limits` summary table listing the first `power` where the submission was not `ACCEPTED` and the observed CPU/clock metrics.
- Memory tests print a similar table including `Max Peak Memory` (KB).

## Fields

- **power:** synthetic scale used by the runner to increase CPU or memory usage in generated programs.
- **maxCpuTime:** maximum CPU time used by the submission (ms).
- **maxClockTime:** wall-clock time (ms) for execution.
- **maxPeakMemory:** peak memory usage (KB) observed during execution.

## When to use this

- Validate sandbox image resource limits after changing container images or runtime limits.
- Detect regressions in resource accounting after changes to cgroup configuration, runner sandboxing, or language runtime updates.

## Troubleshooting

- If submissions never reach `JUDGED`, ensure judge worker and sandbox services are running and reachable by the API.
- If times/memory numbers are zero or suspiciously low, confirm the API returns execution metrics (some setups may strip or not expose these details).
- If the script fails to create a contest or sign in, verify `ROOT_PASSWORD` matches the running API's root user.

## Extending the test

Add or tune per-language runners under `test/load/sandbox-limit/runner/` (for example `python312-runner.ts`). Modify `buildTimeLimitCodeFile` and `buildMemoryLimitCodeFile` to better model your target workloads.

## Latest observed thresholds

TLE summary (first `power` that produced a non-`ACCEPTED` verdict per language):

| language   | power |
|------------|-------|
| CPP_17     | 10    |
| JAVA_21    | 10    |
| PYTHON_312 | 8     |
| NODE_22    | 10    |

MLE summary (first `power` that produced a non-`ACCEPTED` verdict per language):

| language   | power |
|------------|-------|
| CPP_17     | 9     |
| JAVA_21    | 8     |
| PYTHON_312 | 9     |
| NODE_22    | 7     |
