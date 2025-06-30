package io.github.leonfoliveira.judge.common.adapter.bcrypt

import io.github.leonfoliveira.judge.common.port.HashAdapter
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service

@Service
class BCryptHashAdapter : HashAdapter {
    override fun hash(value: String): String {
        return BCrypt.hashpw(value, BCrypt.gensalt())
    }

    override fun verify(
        value: String,
        hash: String,
    ): Boolean {
        return BCrypt.checkpw(value, hash)
    }
}
