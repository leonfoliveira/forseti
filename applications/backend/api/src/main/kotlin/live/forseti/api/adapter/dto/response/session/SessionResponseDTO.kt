package live.forseti.api.adapter.dto.response.session

import live.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import live.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import live.forseti.core.domain.entity.Session
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
