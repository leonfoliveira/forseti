package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.service.dto.output.SubmissionOutputDTO
import java.time.LocalDateTime

data class SubmissionShortResponseDTO(
    val id: Int,
    val problem: SubmissionOutputDTO.ProblemDTO,
    val member: SubmissionOutputDTO.MemberDTO,
    val status: Submission.Status,
    val language: Language,
    val createdAt: LocalDateTime,
)

fun SubmissionOutputDTO.toShortResponseDTO(): SubmissionShortResponseDTO {
    return SubmissionShortResponseDTO(
        id = id,
        problem = problem,
        member = member,
        status = status,
        language = language,
        createdAt = createdAt,
    )
}
