package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.time.LocalDateTime

data class SubmissionOutputDTO(
    val id: Int,
    val problem: ProblemDTO,
    val member: MemberDTO,
    val language: Language,
    val status: Submission.Status,
    val code: DownloadAttachment,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    data class ProblemDTO(
        val id: Int,
        val title: String,
    )

    data class MemberDTO(
        val id: Int,
        val name: String,
    )
}

fun Submission.toOutputDTO(bucketAdapter: BucketAdapter): SubmissionOutputDTO {
    return SubmissionOutputDTO(
        id = id,
        problem =
            SubmissionOutputDTO.ProblemDTO(
                id = problem.id,
                title = problem.title,
            ),
        member =
            SubmissionOutputDTO.MemberDTO(
                id = member.id,
                name = member.name,
            ),
        language = language,
        status = status,
        code = bucketAdapter.createDownloadAttachment(code),
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
