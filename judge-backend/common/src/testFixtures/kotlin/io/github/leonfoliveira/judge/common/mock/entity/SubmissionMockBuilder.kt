package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
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
        language: Language = Language.PYTHON_3_13,
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
