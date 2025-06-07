package io.leonfoliveira.judge.core.domain.entity

import java.util.UUID

object MemberMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Member Name",
        login: String = "member_login",
        password: String = "member_password",
        contest: Contest = ContestMockFactory.build(),
        submissions: List<Submission> = emptyList(),
    ) = Member(
        id = id,
        type = type,
        name = name,
        login = login,
        password = password,
        contest = contest,
        submissions = submissions,
    )
}
