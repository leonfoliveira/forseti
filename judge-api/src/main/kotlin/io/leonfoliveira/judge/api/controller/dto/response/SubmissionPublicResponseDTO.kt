package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class SubmissionPublicResponseDTO(
    val id: Int,
    val member: MemberResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Language,
    val status: Submission.Status,
    val createdAt: LocalDateTime,
)

fun Submission.toPublicResponseDTO(): SubmissionPublicResponseDTO {
    return SubmissionPublicResponseDTO(
        id = id,
        member = member.toPrivateResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        status = status,
        createdAt = createdAt,
    )
}
