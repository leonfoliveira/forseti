package io.github.leonfoliveira.judge.worker.docker

import io.github.leonfoliveira.judge.common.adapter.util.CommandError
import io.github.leonfoliveira.judge.common.adapter.util.CommandRunner
import java.io.File

class DockerContainer(
    private val name: String,
) {
    class DockerTimeOutException() : RuntimeException()

    class DockerOOMKilledException() : RuntimeException()

    companion object {
        fun create(
            imageName: String,
            memoryLimit: Int,
            name: String,
            volume: File,
        ): DockerContainer {
            CommandRunner.run(
                arrayOf(
                    "docker",
                    "create",
                    "--rm",
                    "--cpus=1",
                    "--memory=${memoryLimit}m",
                    "--memory-swap=${memoryLimit}m",
                    "--name",
                    name,
                    "-v",
                    "${volume.absolutePath}:/app",
                    imageName,
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

    fun exec(
        command: Array<String>,
        input: String? = null,
        timeLimit: Int? = null,
    ): String {
        val dockerCommand = mutableListOf("docker", "exec", "-i", name, *command)
        if (timeLimit != null) {
            dockerCommand.addAll(0, listOf("timeout", "-k", "1s", "${timeLimit / 1000.0}s"))
        }

        return try {
            CommandRunner.run(
                dockerCommand.toTypedArray(),
                input,
            )
        } catch (e: CommandError) {
            when (e.exitCode) {
                124 -> throw DockerTimeOutException()
                137 -> throw DockerOOMKilledException()
            }
            throw e
        }
    }
}
