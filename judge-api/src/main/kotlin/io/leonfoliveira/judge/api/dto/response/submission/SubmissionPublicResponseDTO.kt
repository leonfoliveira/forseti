package io.leonfoliveira.judge.api.dto.response.submission

import io.leonfoliveira.judge.api.dto.response.member.MemberPublicResponseDTO
import io.leonfoliveira.judge.api.dto.response.member.toPublicResponseDTO
import io.leonfoliveira.judge.api.dto.response.problem.ProblemPublicResponseDTO
import io.leonfoliveira.judge.api.dto.response.problem.toPublicResponseDTO
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionPublicResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Language,
    val answer: Submission.Answer,
    val createdAt: OffsetDateTime,
)

fun Submission.toPublicResponseDTO(): SubmissionPublicResponseDTO {
    return SubmissionPublicResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        answer = answer,
        createdAt = createdAt,
    )
}
