package io.leonfoliveira.judge.adapter.docker

import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

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

    fun kill() = runCommand(arrayOf("docker", "kill", name))

    fun exec(
        command: Array<String>,
        input: String? = null,
        timeLimit: Long? = null,
    ): String {
        val executor = Executors.newSingleThreadExecutor()
        val future =
            executor.submit<String> {
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

        return try {
            timeLimit?.let { future.get(it, TimeUnit.MILLISECONDS) } ?: future.get()
        } catch (e: TimeoutException) {
            future.cancel(true)
            throw e
        } finally {
            executor.shutdown()
        }
    }
}
