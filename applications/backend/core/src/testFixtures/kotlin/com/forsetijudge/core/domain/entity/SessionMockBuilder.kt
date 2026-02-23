package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object SessionMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        csrfToken: UUID = IdGenerator.getUUID(),
        contest: Contest? = ContestMockBuilder.build(),
        member: Member = MemberMockBuilder.build(),
        expiresAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
    ) = Session(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        csrfToken = csrfToken,
        contest = contest,
        member = member,
        expiresAt = expiresAt,
    ).also {
        contest?.let { c -> it.contestId = c.id }
        it.memberId = member.id
    }
}
