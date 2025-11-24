package live.forseti.api.adapter.dto.response.submission

import live.forseti.api.adapter.dto.response.AttachmentResponseDTO
import live.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import live.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import live.forseti.api.adapter.dto.response.toResponseDTO
import live.forseti.core.domain.entity.Submission
import java.io.Serializable
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
) : Serializable

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
