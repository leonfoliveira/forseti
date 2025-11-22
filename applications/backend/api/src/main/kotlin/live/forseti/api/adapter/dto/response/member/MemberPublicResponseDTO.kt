package live.forseti.api.adapter.dto.response.member

import live.forseti.core.domain.entity.Member
import java.util.UUID

data class MemberPublicResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
)

fun Member.toPublicResponseDTO(): MemberPublicResponseDTO =
    MemberPublicResponseDTO(
        id = id,
        type = type,
        name = name,
    )
