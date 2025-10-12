package io.github.leonfoliveira.forseti.common.mock.entity

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.entity.Execution
import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

object ExecutionMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
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
        lastTestCase = lastTestCase,
        input = input,
        output = output,
    )
}
