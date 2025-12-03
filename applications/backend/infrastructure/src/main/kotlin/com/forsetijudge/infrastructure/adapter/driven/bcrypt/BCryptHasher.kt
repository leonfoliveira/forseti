package com.forsetijudge.infrastructure.adapter.driven.bcrypt

import com.forsetijudge.core.port.driven.Hasher
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class BCryptHasher : Hasher {
    private val encoder = BCryptPasswordEncoder()

    /**
     * Hashes the given value using BCrypt algorithm
     *
     * @param value the value to be hashed
     * @return the hashed value
     */
    override fun hash(value: String): String = encoder.encode(value)

    /**
     * Verifies if the given value matches the given hash using BCrypt algorithm
     *
     * @param value the value to be verified
     * @param hash the hash to be compared against
     */
    override fun verify(
        value: String,
        hash: String,
    ): Boolean =
        try {
            encoder.matches(value, hash)
        } catch (e: IllegalArgumentException) {
            false
        }
}
