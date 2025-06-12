package io.github.leonfoliveira.judge.adapter.util

import java.io.BufferedReader
import java.io.InputStreamReader

object CommandRunner {
    fun run(
        command: Array<String>,
        input: String? = null,
    ): String {
        val processBuilder = ProcessBuilder()
        processBuilder.command(*command)

        val process = processBuilder.start()
        input?.let {
            process.outputStream.bufferedWriter().use { writer ->
                writer.write(it)
            }
        }

        val output = BufferedReader(InputStreamReader(process.inputStream)).readText()
        val error = BufferedReader(InputStreamReader(process.errorStream)).readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw CommandError(
                message = "Command failed with exit code: $exitCode. Error: $error",
                exitCode = exitCode,
            )
        }

        return output
    }
}
