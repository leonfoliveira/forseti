package com.forsetijudge.core.domain.entity

import java.time.OffsetDateTime
import java.util.UUID

object SubmissionMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        member: Member = MemberMockBuilder.build(),
        problem: Problem = ProblemMockBuilder.build(),
        language: Submission.Language = Submission.Language.PYTHON_312,
        status: Submission.Status = Submission.Status.JUDGING,
        answer: Submission.Answer = Submission.Answer.NO_ANSWER,
        code: Attachment = AttachmentMockBuilder.build(),
    ) = Submission(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        member = member,
        problem = problem,
        language = language,
        status = status,
        answer = answer,
        code = code,
    )
}
