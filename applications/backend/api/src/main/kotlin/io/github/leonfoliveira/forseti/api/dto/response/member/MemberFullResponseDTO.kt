package io.github.leonfoliveira.forseti.api.dto.response.member

import io.github.leonfoliveira.forseti.common.domain.entity.Member
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
