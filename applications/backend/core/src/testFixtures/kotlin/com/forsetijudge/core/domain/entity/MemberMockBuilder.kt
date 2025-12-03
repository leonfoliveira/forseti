package com.forsetijudge.core.domain.entity

import java.time.OffsetDateTime
import java.util.UUID

object MemberMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest? = ContestMockBuilder.build(),
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Test Member",
        login: String = "test_member",
        password: String = "password",
        submissions: List<Submission> = emptyList(),
    ) = Member(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        type = type,
        name = name,
        login = login,
        password = password,
        submissions = submissions,
    )
}
