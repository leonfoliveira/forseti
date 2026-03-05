# AutoJudge

The Forseti AutoJudge service is a distributed code execution and evaluation system that automatically judges programming submissions in competitive programming contests. This Spring Boot microservice provides secure, resource-constrained code execution in isolated Docker containers with comprehensive test case validation and detailed result reporting.

## Key Features

- **Multi-Language Support**: Optimized compilation and execution of many programming languages
- **Sandboxed Execution**: Isolated Docker containers with strict resource limits and security constraints
- **Scalable Processing**: Configurable concurrent submission processing via RabbitMQ message queues
- **Comprehensive Testing**: Individual test case validation with detailed pass/fail tracking and output comparison
- **Fault Tolerance**: Robust error handling with specific categorization (compilation, runtime, resource limits)
- **Audit Trail**: Complete execution tracking with input/output preservation and performance metrics

## Async Events

### Consumers

Handles messages from RabbitMQ queues.

#### Submission

Handles submission to be judged by the AutoJudge service. Submissions from `UNOFFICIAL_CONTESTANT` have lower priority than `CONTESTANT` submissions.

- **Queue**: `submission-queue`
- **DLQ**: `submission-failed-queue`
- **Body**:
```json
{
  "submissionId": "string (uuidv7)"
}
```

## Judging Process

The AutoJudge service executes untrusted code in heavily secured Docker containers with multiple layers of protection.

### Container Creation Flags

All sandbox containers are created with the following security and resource constraints:

- `--rm`: Automatically remove container after execution
- `--network none`: Disable all network access
- `--cap-drop=ALL`: Remove all Linux capabilities
- `--security-opt=no-new-privileges`: Prevent privilege escalation
- `--pids-limit=64`: Limit process count to prevent fork bombs
- `--cpus=1`: Restrict CPU usage to a single core
- `--memory={memoryLimit}m`: Enforce memory limit with cgroups
- `--memory-swap={memoryLimit}m`: Enforce memory swap limit to prevent disk usage
- `--name={name}`: Unique container name

### Language-Specific Containers

Each programming language has a dedicated, hardened container image.

#### C++

##### CPP_17 (forseti-sb-cpp17)

**Base Image:** Alpine 3.22.1 for minimal attack surface

**Commands:**

- Compilation: `g++ -o a.out {file} -O2 -std=c++17 -DONLINE_JUDGE`
- Execution: `./a.out`

#### Java

##### Java_21 (forseti-sb-java21)

**Base Image:** Alpine 3.22.1 with OpenJDK 21 LTS

**Commands:**

- Compilation: `javac -d . {file}`
- Execution: `java -Xmx{memoryLimit}m -cp . {file}`

#### Python

##### Python 3.12 (forseti-sb-python312)

**Commands:**

- Compilation: None
- Execution: `python {file}`

### Execution Pipeline

1. **Creation:**
    - Create a temporary container with the appropriate image for the submission language, problem memory limit, and flags for security and resource constraints.
    - Entrypoint is `sleep infinity` to keep the container alive for the duration of the execution process.
    - Copy the submission source code into the container's filesystem.
2. **Compilation:**
    - For compiled languages (C++, Java), execute the compilation command inside the container.
    - If compilation fails, finishes judge process with `COMPILATION_ERROR` answer.
3. **Execution:**
    - For each test case, execute the program inside the container with the test case input.
    - Enforce time limits, if any execution times out, finishes judge process with `TIME_LIMIT_EXCEEDED` answer.
    - If any execution exceeds memory limits, finishes judge process with `MEMORY_LIMIT_EXCEEDED` answer.
    - If any execution returns a non-zero exit code, finishes judge process with `RUNTIME_ERROR` answer.
    - If any execution output does not match the expected output, finishes judge process with `WRONG_ANSWER` answer.
    - If all test cases pass, finishes judge process with `ACCEPTED` answer.
4. **Finalization:**
    - Kill the container, which will be automatically removed due to the `--rm` flag.
    - Create an `Execution` entity with the final answer, number of test cases, and number of approved test cases.
    - Updates the `Submission` entity with the final answer and status.
    