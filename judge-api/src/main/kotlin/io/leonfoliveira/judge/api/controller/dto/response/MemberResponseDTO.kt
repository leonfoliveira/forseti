package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Member

data class MemberResponseDTO(
    val id: Int,
    val type: Member.Type,
    val name: String,
    val login: String,
)

fun Member.toPrivateResponseDTO(): MemberResponseDTO {
    return MemberResponseDTO(
        id = id,
        type = type,
        name = name,
        login = login,
    )
}
