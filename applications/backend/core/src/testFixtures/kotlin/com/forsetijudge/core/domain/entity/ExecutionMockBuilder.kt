package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object ExecutionMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        submission: Submission = SubmissionMockBuilder.build(),
        answer: Submission.Answer = Submission.Answer.ACCEPTED,
        totalTestCases: Int = 1,
        lastTestCase: Int = 0,
        input: Attachment = AttachmentMockBuilder.build(),
        output: Attachment = AttachmentMockBuilder.build(),
    ) = Execution(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        submission = submission,
        answer = answer,
        totalTestCases = totalTestCases,
        approvedTestCases = lastTestCase,
        input = input,
        output = output,
    )
}
