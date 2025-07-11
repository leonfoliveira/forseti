package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import java.time.OffsetDateTime
import java.util.UUID

object AuthorizationMockBuilder {
    fun buildMember(
        id: UUID = UUID.randomUUID(),
        contestId: UUID? = null,
        name: String = "Test Member",
        type: Member.Type = Member.Type.CONTESTANT,
    ) = AuthorizationMember(
        id = id,
        contestId = contestId,
        name = name,
        type = type,
    )

    fun build(
        member: AuthorizationMember = buildMember(),
        accessToken: String = "testAccessToken",
        expiresAt: OffsetDateTime = OffsetDateTime.now().plusHours(1)
    ) = Authorization(
        member = member,
        accessToken = accessToken,
        expiresAt = expiresAt
    )
}