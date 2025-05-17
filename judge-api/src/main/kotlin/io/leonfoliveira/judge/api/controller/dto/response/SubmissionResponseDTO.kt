package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class SubmissionResponseDTO(
    val id: Int,
    val problemId: Int,
    val memberId: Int,
    val status: Submission.Status,
    val language: Language,
    val createdAt: LocalDateTime,
)

fun Submission.toResponseDTO(): SubmissionResponseDTO {
    return SubmissionResponseDTO(
        id = id,
        problemId = problem.id,
        memberId = member.id,
        status = status,
        language = language,
        createdAt = createdAt,
    )
}
