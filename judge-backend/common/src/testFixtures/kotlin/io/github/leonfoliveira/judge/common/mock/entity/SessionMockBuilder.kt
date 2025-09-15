package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Session
import java.time.OffsetDateTime
import java.util.UUID

object SessionMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        member: Member = MemberMockBuilder.build(),
        expiresAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
    ) = Session(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        member = member,
        expiresAt = expiresAt,
    )
}
