package com.forsetijudge.core.port.dto.response.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberResponseBodyDTO,
    val problem: ProblemResponseBodyDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer?,
    val version: Long,
) : Serializable

fun Submission.toResponseBodyDTO(): SubmissionResponseBodyDTO =
    SubmissionResponseBodyDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        member = member.toResponseBodyDTO(),
        problem = problem.toResponseBodyDTO(),
        language = language,
        status = status,
        answer = answer,
        version = version,
    )
