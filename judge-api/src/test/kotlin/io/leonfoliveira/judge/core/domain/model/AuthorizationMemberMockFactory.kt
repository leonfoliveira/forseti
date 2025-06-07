package io.leonfoliveira.judge.core.domain.model

import io.leonfoliveira.judge.core.domain.entity.Member
import java.util.UUID

object AuthorizationMemberMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
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
