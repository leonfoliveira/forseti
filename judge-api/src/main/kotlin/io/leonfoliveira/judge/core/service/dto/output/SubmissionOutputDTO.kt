package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.time.LocalDateTime

data class SubmissionOutputDTO(
    val id: Int,
    val problemId: Int,
    val memberId: Int,
    val language: Language,
    val status: Submission.Status,
    val code: DownloadAttachment,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
)

fun Submission.toOutputDTO(bucketAdapter: BucketAdapter): SubmissionOutputDTO {
    return SubmissionOutputDTO(
        id = id,
        problemId = problem.id,
        memberId = member.id,
        language = language,
        status = status,
        code = bucketAdapter.createDownloadAttachment(code),
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
