package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import java.time.OffsetDateTime
import java.util.UUID

object ClarificationMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        member: Member = MemberMockBuilder.build(),
        problem: Problem? = ProblemMockBuilder.build(),
        parent: Clarification? = null,
        text: String = "This is a test clarification.",
        children: List<Clarification> = emptyList(),
    ) = Clarification(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        member = member,
        problem = problem,
        parent = parent,
        text = text,
        children = children,
    )
}