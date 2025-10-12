package io.github.leonfoliveira.forseti.common.mock.entity

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.domain.entity.Problem
import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

object ProblemMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        letter: Char = 'A',
        title: String = "Sample Problem",
        description: Attachment = AttachmentMockBuilder.build(),
        timeLimit: Int = 1000,
        memoryLimit: Int = 512,
        testCases: Attachment = AttachmentMockBuilder.build(),
        submissions: List<Submission> = emptyList(),
    ) = Problem(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        letter = letter,
        title = title,
        description = description,
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases,
        submissions = submissions,
    )
}
