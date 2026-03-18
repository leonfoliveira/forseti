package com.forsetijudge.infrastructure.adapter.util.command

/**
 * Exception representing an error that occurred during the execution of a command-line process.
 *
 * @param stderr The standard error output from the command-line process.
 * @param exitCode The exit code returned by the command-line process.
 */
class CommandError(
    val stderr: String,
    val exitCode: Int,
) : RuntimeException(stderr)
