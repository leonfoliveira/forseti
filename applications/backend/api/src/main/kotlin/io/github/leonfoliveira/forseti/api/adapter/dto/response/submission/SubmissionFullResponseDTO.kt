package io.github.leonfoliveira.forseti.api.adapter.dto.response.submission

import io.github.leonfoliveira.forseti.api.adapter.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.toResponseDTO
import live.forseti.core.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionFullResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer,
    val code: AttachmentResponseDTO,
    val createdAt: OffsetDateTime,
)

fun Submission.toFullResponseDTO(): SubmissionFullResponseDTO =
    SubmissionFullResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        status = status,
        answer = answer,
        code = code.toResponseDTO(),
        createdAt = createdAt,
    )
