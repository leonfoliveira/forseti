package io.github.leonfoliveira.judge.common.adapter.util

class CommandError(message: String, val exitCode: Int) : RuntimeException(message)
