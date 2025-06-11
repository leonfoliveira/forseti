package io.leonfoliveira.judge.core.domain.entity

import java.util.UUID

object ProblemMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        letter: Char = 'A',
        title: String = "Problem Name",
        description: Attachment = AttachmentMockFactory.build(),
        timeLimit: Int = 1000,
        memoryLimit: Int = 1024,
        testCases: Attachment = AttachmentMockFactory.build(),
        submissions: List<Submission> = emptyList(),
        contest: Contest = ContestMockFactory.build(),
    ) = Problem(
        id = id,
        letter = letter,
        title = title,
        description = description,
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases,
        submissions = submissions,
        contest = contest,
    )
}
