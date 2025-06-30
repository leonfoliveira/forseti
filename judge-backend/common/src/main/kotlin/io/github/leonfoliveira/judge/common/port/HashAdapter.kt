package io.github.leonfoliveira.judge.common.port

interface HashAdapter {
    fun hash(value: String): String

    fun verify(
        value: String,
        hash: String,
    ): Boolean
}
