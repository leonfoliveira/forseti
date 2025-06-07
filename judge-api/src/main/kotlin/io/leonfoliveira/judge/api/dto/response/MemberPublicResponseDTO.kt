package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Member
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
