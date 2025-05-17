package io.leonfoliveira.judge.adapter.util

import java.io.BufferedReader
import java.io.InputStreamReader

object CommandRunner {
    fun run(
        command: Array<String>,
        input: String? = null,
    ): String {
        val processBuilder = ProcessBuilder()
        val shellCommand =
            if (System.getProperty("os.name").lowercase().contains("win")) {
                arrayOf("cmd", "/c") + command
            } else {
                arrayOf("sh", "-c") + command
            }
        processBuilder.command(*shellCommand)

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
            throw RuntimeException("Command failed with exit code $exitCode: $error")
        }

        return output
    }
}
