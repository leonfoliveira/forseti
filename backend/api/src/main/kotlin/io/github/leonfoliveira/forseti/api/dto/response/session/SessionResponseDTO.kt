package io.github.leonfoliveira.forseti.api.dto.response.session

import io.github.leonfoliveira.forseti.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Session
import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val expiresAt: OffsetDateTime,
)

fun Session.toResponseDTO() =
    SessionResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        expiresAt = expiresAt,
    )
