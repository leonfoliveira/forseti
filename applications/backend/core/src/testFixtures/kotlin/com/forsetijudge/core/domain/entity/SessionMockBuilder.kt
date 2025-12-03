package com.forsetijudge.core.domain.entity

import java.time.OffsetDateTime
import java.util.UUID

object SessionMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        csrfToken: UUID = UUID.randomUUID(),
        member: Member = MemberMockBuilder.build(),
        expiresAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
    ) = Session(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        csrfToken = csrfToken,
        member = member,
        expiresAt = expiresAt,
    )
}
