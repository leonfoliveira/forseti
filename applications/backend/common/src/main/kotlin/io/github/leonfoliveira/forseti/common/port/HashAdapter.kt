package io.github.leonfoliveira.forseti.common.port

interface HashAdapter {
    /**
     * Generates a hash for the given value
     */
    fun hash(value: String): String

    /**
     * Verifies if the given value matches the given hash
     */
    fun verify(
        value: String,
        hash: String,
    ): Boolean
}
