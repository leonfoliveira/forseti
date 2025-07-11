package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Submission
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
        isSystem: Boolean = false,
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
        isSystem = isSystem,
        submissions = submissions,
    )
}