package com.forsetijudge.api.adapter.dto.response.submission

import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionPublicResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer,
    val createdAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Submission.toPublicResponseDTO(): SubmissionPublicResponseDTO =
    SubmissionPublicResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        status = status,
        answer = answer,
        createdAt = createdAt,
        version = version,
    )
