package io.leonfoliveira.judge.core.port

interface HashAdapter {
    fun hash(value: String): String

    fun verify(value: String, hash: String): Boolean
}