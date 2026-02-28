package com.forsetijudge.core.port.driven.cryptography

interface Hasher {
    /**
     * Generates a hash for the given value
     *
     * @param value the value to be hashed
     * @return the generated hash
     */
    fun hash(value: String): String

    /**
     * Verifies if the given value matches the given hash
     *
     * @param value the value to be verified
     * @param hash the hash to verify against
     * @return true if the value matches the hash, false otherwise
     */
    fun verify(
        value: String,
        hash: String,
    ): Boolean
}
