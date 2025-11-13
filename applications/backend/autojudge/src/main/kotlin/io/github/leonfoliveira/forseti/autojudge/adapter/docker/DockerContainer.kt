package io.github.leonfoliveira.forseti.autojudge.adapter.docker

import io.github.leonfoliveira.forseti.common.adapter.util.CommandError
import io.github.leonfoliveira.forseti.common.adapter.util.CommandRunner
import java.io.File

/**
 * Represents a Docker container used for code execution
 */
class DockerContainer(
    private val name: String,
) {
    /**
     * Thrown when a Docker execution times out
     */
    class DockerTimeOutException : RuntimeException()

    /**
     * Thrown when a Docker execution is killed due to OOM
     */
    class DockerOOMKilledException : RuntimeException()

    companion object {
        /**
         * Creates a new Docker container with the specified parameters.
         * It is configured with strict security and resource limits to safely execute untrusted code.
         *
         * @param imageName The Docker image name
         * @param memoryLimit The memory limit in megabytes
         * @param name The name of the container
         * @return The created DockerContainer instance
         */
        fun create(
            imageName: String,
            memoryLimit: Int,
            name: String,
        ): DockerContainer {
            CommandRunner.run(
                arrayOf(
                    "docker",
                    "create",
                    // Automatically remove the container when it exits
                    "--rm",
                    // Re-enable read-only with proper tmpfs mounts
                    "--network=none",
                    // Drop all capabilities
                    "--cap-drop=ALL",
                    // Disable privilege escalation
                    "--security-opt=no-new-privileges",
                    // Limit the number of processes
                    "--pids-limit=64",
                    // Limit CPU and memory
                    "--cpus=1",
                    "--memory=${memoryLimit}m",
                    "--memory-swap=${memoryLimit}m",
                    // Container name
                    "--name=$name",
                    imageName,
                    // Keep the container running
                    "sleep",
                    "infinity",
                ),
            )
            return DockerContainer(name)
        }
    }

    /**
     * Starts the Docker container.
     */
    fun start() {
        CommandRunner.run(arrayOf("docker", "start", name))
    }

    /**
     * Kills the Docker container.
     */
    fun kill() {
        CommandRunner.run(arrayOf("docker", "kill", name))
    }

    /**
     * Copies a file from the host to the Docker container.
     *
     * @param source The source file on the host
     * @param destination The destination path inside the container
     */
    fun copy(
        source: File,
        destination: String,
    ) {
        CommandRunner.run(arrayOf("docker", "cp", source.absolutePath, "$name:$destination"))
    }

    /**
     * Executes a command inside the Docker container.
     *
     * @param command The command to execute
     * @param input Optional input to pass to the command's stdin
     * @param timeLimit Optional time limit in milliseconds for the command execution
     * @return The command's stdout output
     * @throws DockerTimeOutException if the command times out
     * @throws DockerOOMKilledException if the command is killed due to OOM
     */
    fun exec(
        command: Array<String>,
        input: String? = null,
        timeLimit: Int? = null,
    ): String {
        val dockerCommand = mutableListOf<String>()

        if (timeLimit != null) {
            dockerCommand.addAll(listOf("timeout", "--kill-after=1s", "${timeLimit / 1000.0}s"))
        }

        dockerCommand.addAll(listOf("docker", "exec", "-i", name))
        dockerCommand.addAll(command)

        return try {
            CommandRunner.run(
                dockerCommand.toTypedArray(),
                input,
            )
        } catch (e: CommandError) {
            when (e.exitCode) {
                // Java returns code 1 for OOM, so we need to check the error message
                1 -> if (e.message?.contains("java.lang.OutOfMemoryError") == true) throw DockerOOMKilledException()
                // 124 = timeout, 143 = SIGTERM from timeout
                124, 143 -> throw DockerTimeOutException()
                // SIGKILL (OOM or timeout kill)
                137 -> throw DockerOOMKilledException()
            }
            throw e
        }
    }
}
