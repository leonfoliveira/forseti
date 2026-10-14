package com.forsetijudge.core.port.dto.response.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionWithCodeResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberResponseDTO,
    val problem: ProblemResponseDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer?,
    val code: AttachmentResponseDTO,
    val version: Long,
) : Serializable

fun Submission.toWithCodeResponseDTO(): SubmissionWithCodeResponseDTO =
    SubmissionWithCodeResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        member = member.toResponseDTO(),
        problem = problem.toResponseDTO(),
        language = language,
        status = status,
        answer = answer,
        code = code.toResponseDTO(),
        version = version,
    )
