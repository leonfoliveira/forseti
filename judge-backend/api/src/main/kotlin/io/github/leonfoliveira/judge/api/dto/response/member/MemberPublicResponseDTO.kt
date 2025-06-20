package io.github.leonfoliveira.judge.api.dto.response.member

import io.github.leonfoliveira.judge.common.domain.entity.Member
import java.util.UUID

data class MemberPublicResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
)

fun Member.toPublicResponseDTO(): MemberPublicResponseDTO {
    return MemberPublicResponseDTO(
        id = id,
        type = type,
        name = name,
    )
}
