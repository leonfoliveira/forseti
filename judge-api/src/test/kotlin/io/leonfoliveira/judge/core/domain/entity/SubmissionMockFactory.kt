package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.util.UUID

object SubmissionMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        member: Member = MemberMockFactory.build(),
        problem: Problem = ProblemMockFactory.build(),
        language: Language = Language.PYTHON_3_13_3,
        status: Submission.Status = Submission.Status.JUDGING,
        answer: Submission.Answer = Submission.Answer.ACCEPTED,
        code: Attachment = AttachmentMockFactory.build(),
    ) = Submission(
        id = id,
        member = member,
        problem = problem,
        language = language,
        status = status,
        answer = answer,
        code = code,
    )
}
