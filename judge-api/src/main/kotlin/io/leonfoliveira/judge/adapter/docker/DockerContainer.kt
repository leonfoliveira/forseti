package io.leonfoliveira.judge.adapter.docker

import java.io.File

class DockerContainer(
    private val name: String,
) {
    companion object {
        fun create(
            imageName: String,
            name: String,
            volume: File,
        ): DockerContainer {
            runCommand(
                arrayOf(
                    "docker",
                    "create",
                    "--rm",
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

        private fun runCommand(
            command: Array<String>,
            input: String? = null,
        ): String {
            val process =
                ProcessBuilder(*command)
                    .redirectErrorStream(true).start()

            if (input != null) {
                process.outputStream.bufferedWriter().use { it.write(input) }
            }
            val output = process.inputStream.bufferedReader().use { it.readText() }
            val exitCode = process.waitFor()

            if (exitCode != 0) {
                throw RuntimeException("Command failed with exit code $exitCode: $output")
            }

            return output
        }
    }

    fun start() = runCommand(arrayOf("docker", "start", name))

    fun stop() = runCommand(arrayOf("docker", "stop", name))

    fun exec(
        command: Array<String>,
        input: String? = null,
    ): String =
        runCommand(
            arrayOf(
                "docker",
                "exec",
                "-i",
                name,
                *command,
            ),
            input,
        )
}
