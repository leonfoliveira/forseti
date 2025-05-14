package io.leonfoliveira.judge.core.domain.entity

import java.time.LocalDateTime

object MemberMockFactory {
    fun build(
        id: Int = 1,
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime = LocalDateTime.now(),
        deletedAt: LocalDateTime? = null,
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Member Name",
        login: String = "member_login",
        password: String = "member_password",
        contest: Contest = ContestMockFactory.build(),
        submissions: List<Submission> = emptyList(),
    ) = Member(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        type = type,
        name = name,
        login = login,
        password = password,
        contest = contest,
        submissions = submissions,
    )
}
