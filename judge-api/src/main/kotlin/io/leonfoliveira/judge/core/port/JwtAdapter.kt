package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.model.Authorization

interface JwtAdapter {
    fun generateToken(claims: Authorization): String

    fun validateToken(token: String): Boolean

    fun decodeToken(token: String): Authorization
}
