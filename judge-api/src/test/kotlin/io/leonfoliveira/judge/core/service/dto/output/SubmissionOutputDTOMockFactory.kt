package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

object SubmissionOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        problem: SubmissionOutputDTO.ProblemDTO =
            SubmissionOutputDTO.ProblemDTO(
                id = 1,
                title = "Sample Problem",
            ),
        member: SubmissionOutputDTO.MemberDTO =
            SubmissionOutputDTO.MemberDTO(
                id = 1,
                name = "Sample Member",
            ),
        language: Language = Language.PYTHON_3_13_3,
        status: Submission.Status = Submission.Status.ACCEPTED,
        codeKey: UUID = UUID.randomUUID(),
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime = LocalDateTime.now(),
    ) = SubmissionOutputDTO(
        id = id,
        problem = problem,
        member = member,
        language = language,
        status = status,
        codeKey = codeKey,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
