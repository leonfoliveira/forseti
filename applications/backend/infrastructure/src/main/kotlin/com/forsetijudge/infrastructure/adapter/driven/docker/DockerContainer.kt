package com.forsetijudge.infrastructure.adapter.driven.docker

import com.forsetijudge.infrastructure.adapter.util.command.CommandRunner
import java.io.File

/**
 * Represents a Docker container used for code execution
 */
class DockerContainer(
    private val name: String,
) {
    companion object {
        /**
         * Creates a new Docker container with the specified parameters.
         * It is configured with strict security and resource limits to safely execute untrusted code.
         *
         * @param image The Docker image to use
         * @param name The name of the container
         * @param flags Additional flags to pass to the `docker create` command
         * @param cmd The command to run in the container
         * @return The created DockerContainer instance
         */
        fun create(
            image: String,
            name: String,
            flags: Array<String> = emptyArray(),
            cmd: Array<String> = arrayOf(),
        ): DockerContainer {
            var command = arrayOf("docker", "create")

            command += flags
            command += arrayOf("--name=$name", image)
            command += cmd

            CommandRunner.run(command)

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
     * @param stdin Optional input to be passed to the command's standard input
     * @return The command's stdout output
     */
    fun exec(
        command: Array<String>,
        stdin: String? = null,
        flags: Array<String> = emptyArray(),
    ): String {
        val cmd = arrayOf("docker", "exec") + flags + arrayOf("-i", name) + command
        return CommandRunner.run(
            cmd,
            stdin,
        )
    }
}
