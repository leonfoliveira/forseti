package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Submission

data class SubmissionResponseDTO(
    val id: Int,
    val problemId: Int,
    val memberId: Int,
    val status: String,
    val language: String,
    val createdAt: String,
    val updatedAt: String,
)

fun Submission.toResponseDTO(): SubmissionResponseDTO {
    return SubmissionResponseDTO(
        id = id,
        problemId = problem.id,
        memberId = member.id,
        status = status.name,
        language = language.name,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
    )
}
