package com.forsetijudge.infrastructure.adapter.util.command

import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.InputStreamReader

object CommandRunner {
    private val logger = LoggerFactory.getLogger(CommandRunner::class.java)

    /**
     * Runs a command-line process with the specified command and optional input.
     *
     * @param command The command to execute as an array of strings.
     * @param input Optional input to be passed to the process's standard input.
     * @return The standard output of the process as a string.
     * @throws CommandError if the process exits with a non-zero exit code.
     */
    fun run(
        command: Array<String>,
        input: String? = null,
    ): String {
        val processBuilder = ProcessBuilder()
        logger.info("Running command: ${command.joinToString(" ")}")
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
        logger.info("Command completed with exit code: $exitCode")
        if (exitCode != 0) {
            throw CommandError(
                message = "Command failed with exit code: $exitCode. Error: $error",
                exitCode = exitCode,
            )
        }

        return output
    }
}
