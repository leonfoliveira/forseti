package com.forsetijudge.core.port.dto.response.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseDTO
import com.forsetijudge.core.port.dto.response.execution.ExecutionResponseDTO
import com.forsetijudge.core.port.dto.response.execution.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionWithCodeAndExecutionsResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val member: MemberResponseDTO,
    val problem: ProblemResponseDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer?,
    val code: AttachmentResponseDTO,
    val executions: List<ExecutionResponseDTO>,
    val version: Long,
) : Serializable

fun Submission.toWithCodeAndExecutionResponseDTO(): SubmissionWithCodeAndExecutionsResponseDTO =
    SubmissionWithCodeAndExecutionsResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        member = member.toResponseDTO(),
        problem = problem.toResponseDTO(),
        language = language,
        status = status,
        answer = answer,
        code = code.toResponseDTO(),
        executions = executions.map { it.toResponseDTO() },
        version = version,
    )
