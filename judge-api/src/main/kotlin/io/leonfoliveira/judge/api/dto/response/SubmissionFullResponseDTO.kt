package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

data class SubmissionFullResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Language,
    val status: Submission.Status,
    val code: AttachmentResponseDTO,
    val createdAt: LocalDateTime,
)

fun Submission.toFullResponseDTO(): SubmissionFullResponseDTO {
    return SubmissionFullResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        status = status,
        code = code.toResponseDTO(),
        createdAt = createdAt,
    )
}
