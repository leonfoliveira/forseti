package io.leonfoliveira.judge.core.domain.entity

import java.time.LocalDateTime

object ProblemMockFactory {
    fun build(
        id: Int = 1,
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime = LocalDateTime.now(),
        deletedAt: LocalDateTime? = null,
        title: String = "Problem Name",
        description: Attachment = AttachmentMockFactory.build(),
        timeLimit: Int = 1000,
        testCases: Attachment = AttachmentMockFactory.build(),
        submissions: List<Submission> = emptyList(),
        contest: Contest = ContestMockFactory.build(),
    ) = Problem(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
        submissions = submissions,
        contest = contest,
    )
}
