package io.leonfoliveira.judge.core.domain.model

data class Authorization(
    val member: AuthorizationMember,
    val accessToken: String,
)
