package com.forsetijudge.infrastructure.adapter.driven.bcrypt

import at.favre.lib.crypto.bcrypt.BCrypt
import com.forsetijudge.core.port.driven.Hasher
import org.springframework.stereotype.Service

@Service
class BCryptHasher : Hasher {
    /**
     * Hashes the given value using BCrypt algorithm
     *
     * @param value the value to be hashed
     * @return the hashed value
     */
    override fun hash(value: String): String = BCrypt.withDefaults().hashToString(12, value.toCharArray())

    /**
     * Verifies if the given value matches the given hash using BCrypt algorithm
     *
     * @param value the value to be verified
     * @param hash the hash to be compared against
     */
    override fun verify(
        value: String,
        hash: String,
    ): Boolean = BCrypt.verifyer().verify(value.toCharArray(), hash).verified
}
