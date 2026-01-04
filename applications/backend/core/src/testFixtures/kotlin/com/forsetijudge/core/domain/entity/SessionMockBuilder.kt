package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
import java.time.OffsetDateTime
import java.util.UUID

object SessionMockBuilder {
    fun build(
        id: UUID = UuidCreator.getTimeOrderedEpoch(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        csrfToken: UUID = UuidCreator.getTimeOrderedEpoch(),
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
