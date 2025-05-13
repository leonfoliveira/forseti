package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.model.Authorization

interface JwtAdapter {
    fun generateToken(authorization: Authorization): String

    fun decodeToken(token: String): Authorization
}
