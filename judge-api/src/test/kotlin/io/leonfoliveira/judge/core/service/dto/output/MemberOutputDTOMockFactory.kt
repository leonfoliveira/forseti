package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Member

object MemberOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Contestant",
        login: String = "contestant",
    ) = MemberOutputDTO(
        id = id,
        type = type,
        name = name,
        login = login,
    )
}
