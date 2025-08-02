package io.github.leonfoliveira.judge.api.dto.response

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import java.time.OffsetDateTime

data class AuthorizationResponseDTO(
    val member: AuthorizationMember,
    val expiresAt: OffsetDateTime,
)

fun Authorization.toResponseDTO()= AuthorizationResponseDTO(
    member = this.member,
    expiresAt = this.expiresAt,
)

