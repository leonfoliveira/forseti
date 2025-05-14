package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.Attachment

object SubmissionMockFactory {
    fun build(
        id: Int = 1,
        member: Member = MemberMockFactory.build(),
        problem: Problem = ProblemMockFactory.build(),
        language: Language = Language.PYTHON_3_13_3,
        status: Submission.Status = Submission.Status.JUDGING,
        code: Attachment =
            Attachment(
                filename = "code.kt",
                key = "code_key",
            ),
    ) = Submission(
        id = id,
        member = member,
        problem = problem,
        language = language,
        status = status,
        code = code,
    )
}
