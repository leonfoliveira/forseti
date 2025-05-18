package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Member

data class MemberOutputDTO(
    val id: Int,
    val type: Member.Type,
    val name: String,
    val login: String,
)

fun Member.toOutputDTO(): MemberOutputDTO {
    return MemberOutputDTO(
        id = this.id,
        type = this.type,
        name = this.name,
        login = this.login,
    )
}
