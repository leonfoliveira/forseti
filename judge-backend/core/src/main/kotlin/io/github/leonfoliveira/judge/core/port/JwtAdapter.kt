package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.model.AuthorizationMember

interface JwtAdapter {
    fun generateToken(authorization: AuthorizationMember): String

    fun decodeToken(token: String): AuthorizationMember
}
