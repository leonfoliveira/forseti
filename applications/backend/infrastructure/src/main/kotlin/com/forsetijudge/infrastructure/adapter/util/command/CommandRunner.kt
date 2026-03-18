package com.forsetijudge.infrastructure.adapter.util.command

import com.forsetijudge.core.application.util.SafeLogger

object CommandRunner {
    private val logger = SafeLogger(this::class)

    /**
     * Runs a command-line process with the specified command and optional input.
     *
     * @param command The command to execute as an array of strings.
     * @param stdin Optional input to be passed to the process's standard input.
     * @return The standard output of the process as a string.
     * @throws CommandError if the process exits with a non-zero exit code.
     */
    fun run(
        command: Array<String>,
        stdin: String? = null,
    ): String {
        val processBuilder = ProcessBuilder()
        logger.info("Running command: ${command.joinToString(" ")}")
        processBuilder.command(*command)
        processBuilder.redirectErrorStream(true)

        val process = processBuilder.start()
        stdin?.let {
            process.outputStream.bufferedWriter().use { writer ->
                writer.write(it)
            }
        }
        val output = process.inputStream.bufferedReader().readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw CommandError(
                stderr = output,
                exitCode = exitCode,
            )
        }

        return output
    }
}
