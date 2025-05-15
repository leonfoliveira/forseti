package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Member

data class MemberResponseDTO(
    val id: Int,
    val type: Member.Type,
    val name: String,
    val login: String,
)

fun Member.toResponseDTO(): MemberResponseDTO {
    return MemberResponseDTO(
        id = this.id,
        type = this.type,
        name = this.name,
        login = this.login,
    )
}
