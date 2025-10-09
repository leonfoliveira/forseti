package io.github.leonfoliveira.judge.common.adapter.bcrypt

import io.github.leonfoliveira.judge.common.port.HashAdapter
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class BCryptHashAdapter : HashAdapter {
    private val encoder = BCryptPasswordEncoder()

    override fun hash(value: String): String {
        return encoder.encode(value)
    }

    override fun verify(
        value: String,
        hash: String,
    ): Boolean {
        return try {
            encoder.matches(value, hash)
        } catch (e: IllegalArgumentException) {
            false
        }
    }
}
