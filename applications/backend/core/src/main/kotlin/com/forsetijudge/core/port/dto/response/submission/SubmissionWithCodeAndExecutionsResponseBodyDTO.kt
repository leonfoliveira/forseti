package com.forsetijudge.core.port.dto.response.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.execution.ExecutionResponseDTO
import com.forsetijudge.core.port.dto.response.execution.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionWithCodeAndExecutionsResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberResponseBodyDTO,
    val problem: ProblemResponseBodyDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer?,
    val code: AttachmentResponseDTO,
    val executions: List<ExecutionResponseDTO> = emptyList(),
    val version: Long,
) : Serializable

fun Submission.toWithCodeAndExecutionResponseBodyDTO(): SubmissionWithCodeAndExecutionsResponseBodyDTO =
    SubmissionWithCodeAndExecutionsResponseBodyDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        member = member.toResponseBodyDTO(),
        problem = problem.toResponseBodyDTO(),
        language = language,
        status = status,
        answer = answer,
        code = code.toResponseBodyDTO(),
        executions = executions.map { it.toResponseBodyDTO() },
        version = version,
    )
