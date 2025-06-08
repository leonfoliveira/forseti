package io.leonfoliveira.judge.api.dto.response.member

import io.leonfoliveira.judge.core.domain.entity.Member
import java.util.UUID

data class MemberFullResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
    val login: String,
)

fun Member.toFullResponseDTO(): MemberFullResponseDTO {
    return MemberFullResponseDTO(
        id = id,
        type = type,
        name = name,
        login = login,
    )
}
