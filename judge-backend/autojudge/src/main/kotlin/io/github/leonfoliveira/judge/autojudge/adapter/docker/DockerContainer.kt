package io.github.leonfoliveira.judge.autojudge.adapter.docker

import io.github.leonfoliveira.judge.common.adapter.util.CommandError
import io.github.leonfoliveira.judge.common.adapter.util.CommandRunner
import java.io.File

class DockerContainer(
    private val name: String,
) {
    class DockerTimeOutException : RuntimeException()

    class DockerOOMKilledException : RuntimeException()

    companion object {
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

    fun start() {
        CommandRunner.run(arrayOf("docker", "start", name))
    }

    fun kill() {
        CommandRunner.run(arrayOf("docker", "kill", name))
    }

    fun copy(
        source: File,
        destination: String,
    ) {
        CommandRunner.run(arrayOf("docker", "cp", source.absolutePath, "$name:$destination"))
    }

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
