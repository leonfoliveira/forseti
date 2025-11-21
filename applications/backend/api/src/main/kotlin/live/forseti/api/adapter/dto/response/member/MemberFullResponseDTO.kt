package live.forseti.api.adapter.dto.response.member

import live.forseti.core.domain.entity.Member
import java.util.UUID

data class MemberFullResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
    val login: String,
)

fun Member.toFullResponseDTO(): MemberFullResponseDTO =
    MemberFullResponseDTO(
        id = id,
        type = type,
        name = name,
        login = login,
    )
