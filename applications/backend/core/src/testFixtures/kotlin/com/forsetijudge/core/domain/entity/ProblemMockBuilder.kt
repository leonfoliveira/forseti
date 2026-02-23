package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object ProblemMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        letter: Char = 'A',
        color: String = "#ffffff",
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
        color = color,
        title = title,
        description = description,
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases,
        submissions = submissions,
    ).also {
        it.contestId = contest.id
        it.descriptionId = description.id
        it.testCasesId = testCases.id
    }
}
