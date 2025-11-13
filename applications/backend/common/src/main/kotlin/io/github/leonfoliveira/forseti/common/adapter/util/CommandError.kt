package io.github.leonfoliveira.forseti.common.adapter.util

/**
 * Exception representing an error that occurred during the execution of a command-line process.
 *
 * @param message The error message describing the failure.
 * @param exitCode The exit code returned by the command-line process.
 */
class CommandError(
    message: String,
    val exitCode: Int,
) : RuntimeException(message)
