package io.leonfoliveira.judge.core.domain.model

import io.leonfoliveira.judge.core.domain.entity.Member

object AuthorizationMemberMockFactory {
    fun build(
        id: Int = 1,
        name: String = "name",
        login: String = "login",
        type: Member.Type = Member.Type.CONTESTANT,
    ) = AuthorizationMember(
        id = id,
        name = name,
        login = login,
        type = type,
    )
}
