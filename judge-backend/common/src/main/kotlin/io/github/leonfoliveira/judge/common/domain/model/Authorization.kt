package io.github.leonfoliveira.judge.common.domain.model

import java.time.OffsetDateTime

data class Authorization(
    val member: AuthorizationMember,
    val issuedAt: OffsetDateTime,
    val expiresAt: OffsetDateTime,
)
