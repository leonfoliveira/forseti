package io.github.leonfoliveira.forseti.api.adapter.dto.response.submission

import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import live.forseti.core.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionPublicResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Submission.Language,
    val answer: Submission.Answer,
    val createdAt: OffsetDateTime,
)

fun Submission.toPublicResponseDTO(): SubmissionPublicResponseDTO =
    SubmissionPublicResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        answer = answer,
        createdAt = createdAt,
    )
