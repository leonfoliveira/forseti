package io.github.leonfoliveira.judge.common.domain.model

import java.time.OffsetDateTime

data class Authorization(
    val member: AuthorizationMember,
    val accessToken: String,
    val expiresAt: OffsetDateTime,
)
