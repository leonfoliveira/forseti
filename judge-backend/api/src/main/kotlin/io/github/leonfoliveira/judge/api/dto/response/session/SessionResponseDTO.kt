package io.github.leonfoliveira.judge.api.dto.response.session

import io.github.leonfoliveira.judge.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.judge.common.domain.entity.Session
import java.time.OffsetDateTime

data class SessionResponseDTO(
    val member: MemberPublicResponseDTO,
    val expiresAt: OffsetDateTime,
)

fun Session.toResponseDTO() =
    SessionResponseDTO(
        member = member.toPublicResponseDTO(),
        expiresAt = expiresAt,
    )
