package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object SubmissionMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        member: Member = MemberMockBuilder.build(),
        problem: Problem = ProblemMockBuilder.build(),
        language: Submission.Language = Submission.Language.PYTHON_312,
        status: Submission.Status = Submission.Status.JUDGING,
        answer: Submission.Answer? = null,
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
    ).also {
        it.memberId = member.id
        it.problemId = problem.id
        it.codeId = code.id
    }
}
