package io.leonfoliveira.judge.adapter.util

class CommandError(message: String, val exitCode: Int) : RuntimeException(message)