package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.model.Authorization

interface JwtAdapter {
    fun generateToken(claims: Authorization.Claims): String

    fun validateToken(token: String): Boolean

    fun getClaims(token: String): Authorization.Claims
}