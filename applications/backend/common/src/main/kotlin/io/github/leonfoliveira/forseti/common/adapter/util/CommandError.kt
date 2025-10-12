package io.github.leonfoliveira.forseti.common.adapter.util

class CommandError(message: String, val exitCode: Int) : RuntimeException(message)
