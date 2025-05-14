package io.leonfoliveira.judge.core.domain.entity

object MemberMockFactory {
    fun build(
        id: Int = 1,
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Member Name",
        login: String = "member_login",
        password: String = "member_password",
        contest: Contest = ContestMockFactory.build(),
    ) = Member(
        id = id,
        type = type,
        name = name,
        login = login,
        password = password,
        contest = contest,
    )
}
