package live.forseti.api.adapter.dto.response.submission

import live.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import live.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import live.forseti.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionPublicResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Submission.Language,
    val answer: Submission.Answer,
    val createdAt: OffsetDateTime,
) : Serializable

fun Submission.toPublicResponseDTO(): SubmissionPublicResponseDTO =
    SubmissionPublicResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        answer = answer,
        createdAt = createdAt,
    )
