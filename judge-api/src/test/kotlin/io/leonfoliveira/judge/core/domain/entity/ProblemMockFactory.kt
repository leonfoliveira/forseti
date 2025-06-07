package io.leonfoliveira.judge.core.domain.entity

import java.util.UUID

object ProblemMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        letter: Char = 'A',
        title: String = "Problem Name",
        description: Attachment = AttachmentMockFactory.build(),
        timeLimit: Int = 1000,
        testCases: Attachment = AttachmentMockFactory.build(),
        submissions: List<Submission> = emptyList(),
        contest: Contest = ContestMockFactory.build(),
    ) = Problem(
        id = id,
        letter = letter,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
        submissions = submissions,
        contest = contest,
    )
}
