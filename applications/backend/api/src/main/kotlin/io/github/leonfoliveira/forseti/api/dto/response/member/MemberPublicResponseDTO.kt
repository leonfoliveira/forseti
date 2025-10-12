package io.github.leonfoliveira.forseti.api.dto.response.member

import io.github.leonfoliveira.forseti.common.domain.entity.Member
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
