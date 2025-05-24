package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import java.time.LocalDateTime

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
        code: DownloadAttachment =
            DownloadAttachment(
                filename = "code.py",
                url = "https://example.com/code.py",
            ),
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime = LocalDateTime.now(),
    ) = SubmissionOutputDTO(
        id = id,
        problem = problem,
        member = member,
        language = language,
        status = status,
        code = code,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
