package com.forsetijudge.infrastructure.adapter.driven.docker

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.InternalServerException
import com.forsetijudge.infrastructure.adapter.util.command.CommandError
import java.io.File

class DockerSandboxContainer(
    version: String,
    private val submission: Submission,
    private val codeFile: File,
) {
    /**
     * Represents the metadata returned by Isolate after running the program.
     *
     * @param exitCode The exit code of the program, if it exited normally.
     * @param maxRss The maximum resident set size of the program in kilobytes.
     * @param status The status of the program execution (RE, SG, TO, XX).
     * @param time The CPU time used by the program in fractional seconds.
     */
    data class IsolateMeta(
        val exitCode: Int?,
        val maxRss: Long?,
        val status: Status?,
        val time: Double?,
        val timeWall: Double?,
    ) {
        enum class Status {
            // run-time error, i.e., exited with a non-zero exit code
            RE,

            // program died on a signal
            SG,

            // timed out
            TO,

            // internal error of the sandbox
            XX,
        }
    }

    /**
     * Represents the result of running the program inside the sandbox, including the normalized status, resource usage, and outputs.
     *
     * @param exitCode The exit code of the program, if it exited normally.
     * @param status The normalized status of the run result (OK, TLE, MLE, RE).
     * @param cpuTime The total CPU time used by the program in milliseconds.
     * @param clockTime The total clock time used by the program in milliseconds.
     * @param peakMemory The peak memory usage of the program in kilobytes.
     * @param stdout The standard output produced by the program, if any.
     * @param stderr The standard error produced by the program, if any.
     */
    data class RunResult(
        val exitCode: Int,
        val status: Status,
        val cpuTime: Long,
        val clockTime: Long,
        val peakMemory: Long,
        val stdout: String?,
        val stderr: String?,
    ) {
        enum class Status {
            // run successfully within time and memory limits
            OK,

            // time limit exceeded
            TLE,

            // memory limit exceeded
            MLE,

            // runtime error
            RE,
        }
    }

    /**
     * Configuration for running a submission in a Docker container
     *
     * @param language The programming language of the configuration
     * @param image The Docker image to use
     * @param createCompileCommand Function to create the compile command, or null if no compilation is needed
     * @param createRunCommand Function to create the run command
     */
    data class Config(
        val language: Submission.Language,
        val image: String,
        val createCompileCommand: ((File) -> Array<String>)?,
        val createRunCommand: (File) -> Array<String>,
    )

    private val logger = SafeLogger(this::class)

    private val containerMemoryLimit = submission.problem.memoryLimit + 512

    private val configs =
        mapOf(
            Submission.Language.CPP_17 to
                Config(
                    language = Submission.Language.CPP_17,
                    image = "forseti-sb-cpp17",
                    createCompileCommand = { codeFile ->
                        arrayOf("g++", "-o", "a.out", codeFile.name, "-O2", "-std=c++17", "-DONLINE_JUDGE")
                    },
                    createRunCommand = { _ -> arrayOf("/box/a.out") },
                ),
            Submission.Language.JAVA_21 to
                Config(
                    language = Submission.Language.JAVA_21,
                    image = "forseti-sb-java21",
                    createCompileCommand = { codeFile ->
                        arrayOf("javac", codeFile.name)
                    },
                    createRunCommand = { codeFile ->
                        arrayOf(
                            "/usr/lib/jvm/java-21-openjdk-amd64/bin/java",
                            "-XX:-UseContainerSupport",
                            "-XX:MaxRAMPercentage=80.0",
                            "-XX:+UseSerialGC",
                            "-Xss256k",
                            "-XX:TieredStopAtLevel=1",
                            "-XX:CompressedClassSpaceSize=16m",
                            "-XX:MaxMetaspaceSize=64m",
                            "-Xshare:off",
                            "-cp",
                            "/box",
                            codeFile.nameWithoutExtension,
                        )
                    },
                ),
            Submission.Language.NODE_22 to
                Config(
                    language = Submission.Language.NODE_22,
                    image = "forseti-sb-node22",
                    createCompileCommand = null,
                    createRunCommand = { codeFile ->
                        arrayOf("/usr/bin/node", "/box/${codeFile.name}")
                    },
                ),
            Submission.Language.PYTHON_312 to
                Config(
                    language = Submission.Language.PYTHON_312,
                    image = "forseti-sb-python312",
                    createCompileCommand = null,
                    createRunCommand = { codeFile ->
                        arrayOf("/usr/bin/python3", "/box/${codeFile.name}")
                    },
                ),
        )

    private val config = configs[submission.language]!!

    private val container =
        DockerContainer.create(
            image = "${config.image}:$version",
            name = "${config.image}.${System.currentTimeMillis()}",
            flags =
                arrayOf(
                    // Automatically remove the container when it exits
                    "--rm",
                    // Network isolation
                    "--network=none",
                    // Block additional privileges
                    "--security-opt=no-new-privileges",
                    // Deny access to all devices
                    "--device-cgroup-rule=c *:* m",
                    // Limit processes
                    "--pids-limit=64",
                    // Limit cpu cores
                    "--cpus=1",
                    // Limit memory
                    "--memory=${containerMemoryLimit}m",
                    "--memory-swap=${containerMemoryLimit}m",
                    // 10MB file size limit
                    "--ulimit=fsize=10485760:10485760",
                    // Limit open file descriptors
                    "--ulimit=nofile=64:64",
                    // Limit number of processes
                    "--ulimit=nproc=64:64",
                    // Disable core dumps
                    "--ulimit=core=0:0",
                    // Run in privileged mode to allow Isolate to set up namespaces and cgroups
                    "--privileged",
                ),
            cmd = arrayOf("sleep", "infinity"),
        )

    /**
     * Starts the container and sets up the sandbox environment by initializing Isolate and copying the code file into the container.
     */
    fun start() {
        logger.info("Starting container")
        container.start()
        container.exec(arrayOf("isolate", "--init"), flags = arrayOf("--user=root"))
        container.copy(codeFile, "/var/local/lib/isolate/0/box/${codeFile.name}")
    }

    /**
     * Compiles the code inside the container using the specified compile command from the configuration.
     * If no compile command is defined for the language, this method will skip compilation.
     */
    fun compile() {
        logger.info("Compiling code")
        if (config.createCompileCommand == null) {
            logger.info("No compile command, skipping compilation")
            return
        }
        val flags = arrayOf("-w", "/var/local/lib/isolate/0/box")
        container.exec(config.createCompileCommand(codeFile), flags = flags)
    }

    /**
     * Kills the container, which will stop any running processes inside it and free up resources.
     */
    fun kill() {
        logger.info("Killing container")
        container.kill()
    }

    /**
     * Runs the compiled code inside the container using Isolate, passing the specified standard input,
     * and captures the standard output, standard error, and execution metadata to determine the status of the execution.
     *
     * @param stdin The standard input to be passed to the program during execution.
     * @return The result of the execution, including the exit code, status, total time, peak memory usage, and outputs.
     */
    fun run(stdin: String): RunResult {
        logger.info("Running code")
        val cmd =
            arrayOf(
                "isolate",
                "--box-id=0",
                "--silent",
                "--processes=64",
                "--time=${submission.problem.timeLimit / 1000.0}",
                "--wall-time=${submission.problem.timeLimit / 1000.0 + 1}",
                "--mem=${submission.problem.memoryLimit * 1024}",
                "--meta=/tmp/meta",
                "--run",
                "--",
            ) + config.createRunCommand(codeFile)

        var stdout: String? = null
        var stderr: String? = null
        try {
            stdout = container.exec(cmd, stdin)
        } catch (e: CommandError) {
            stderr = e.stderr
        }

        val rawMeta = container.exec(arrayOf("cat", "/tmp/meta"))
        val mapMeta =
            rawMeta
                .lines()
                .mapNotNull { line ->
                    if (line.isBlank()) return@mapNotNull null
                    val parts = line.split(":", limit = 2)
                    if (parts.size != 2) return@mapNotNull null
                    parts[0].trim() to parts[1].trim()
                }.toMap()
        logger.info("Execution completed. stdout: ${stdout?.take(100)}. stderr: ${stderr?.take(100)}. meta: $mapMeta")
        val meta =
            IsolateMeta(
                exitCode = mapMeta["exitcode"]?.toIntOrNull(),
                maxRss = mapMeta["max-rss"]?.toLongOrNull() ?: 0L,
                status = mapMeta["status"]?.let { IsolateMeta.Status.valueOf(it) },
                time = mapMeta["time"]?.toDoubleOrNull() ?: 0.0,
                timeWall = mapMeta["time-wall"]?.toDoubleOrNull() ?: 0.0,
            )

        return RunResult(
            exitCode = meta.exitCode ?: 0,
            status = parseStatus(meta, stderr),
            cpuTime = meta.time?.times(1000)?.toLong() ?: 0L,
            clockTime = meta.timeWall?.times(1000)?.toLong() ?: 0L,
            peakMemory = meta.maxRss ?: 0L,
            stdout = stdout,
            stderr = stderr,
        )
    }

    /**
     * Parses the Isolate metadata and standard error output to determine the normalized status of the execution result.
     *
     * @param meta The metadata returned by Isolate after execution, containing information about exit code, signal, resource usage, and status.
     * @param stderr The standard error output captured during execution, which may contain clues about memory limit exceeded errors.
     * @return The normalized status of the execution result
     */
    private fun parseStatus(
        meta: IsolateMeta,
        stderr: String?,
    ): RunResult.Status {
        if (meta.status == IsolateMeta.Status.XX) {
            throw InternalServerException("Sandbox internal error: $meta")
        }

        if (meta.status != null) {
            if ((meta.maxRss ?: 0) > submission.problem.memoryLimit * 1024L) {
                return RunResult.Status.MLE
            }

            val mlePatterns = listOf("std::bad_alloc", "java.lang.OutOfMemoryError", "node::OOMErrorHandler", "MemoryError")
            if (mlePatterns.any { it in stderr.orEmpty() }) {
                return RunResult.Status.MLE
            }

            if (meta.status == IsolateMeta.Status.TO) {
                return RunResult.Status.TLE
            }

            return RunResult.Status.RE
        }

        return RunResult.Status.OK
    }
}
