package io.github.leonfoliveira.forseti.api.dto.response.submission

import io.github.leonfoliveira.forseti.api.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.problem.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.toResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Submission
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
