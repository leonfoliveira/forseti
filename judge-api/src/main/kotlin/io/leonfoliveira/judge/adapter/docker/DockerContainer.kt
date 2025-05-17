package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.adapter.util.CommandRunner
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

class DockerContainer(
    val name: String,
) {
    fun start() {
        CommandRunner.run(arrayOf("docker", "start", name))
    }

    fun kill() {
        CommandRunner.run(arrayOf("docker", "kill", name))
    }

    fun exec(
        command: Array<String>,
        input: String? = null,
        timeLimit: Long? = null,
    ): String {
        val executor = Executors.newSingleThreadExecutor()
        val future =
            executor.submit<String> {
                CommandRunner.run(
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
