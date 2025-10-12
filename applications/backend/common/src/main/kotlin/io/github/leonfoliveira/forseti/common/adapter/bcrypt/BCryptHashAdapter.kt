package io.github.leonfoliveira.forseti.common.adapter.bcrypt

import io.github.leonfoliveira.forseti.common.port.HashAdapter
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class BCryptHashAdapter : HashAdapter {
    private val encoder = BCryptPasswordEncoder()

    override fun hash(value: String): String = encoder.encode(value)

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
