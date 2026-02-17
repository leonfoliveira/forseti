package com.forsetijudge.api.adapter.dto.response.submission

import com.forsetijudge.api.adapter.dto.response.AttachmentResponseDTO
import com.forsetijudge.api.adapter.dto.response.execution.ExecutionResponseDTO
import com.forsetijudge.api.adapter.dto.response.execution.toResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.toPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.toResponseDTO
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SubmissionFullWithExecutionResponseDTO(
    val id: UUID,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO,
    val language: Submission.Language,
    val status: Submission.Status,
    val answer: Submission.Answer,
    val code: AttachmentResponseDTO,
    val createdAt: OffsetDateTime,
    val executions: List<ExecutionResponseDTO>,
    val version: Long,
) : Serializable

fun Submission.toFullWithExecutionResponseDTO(): SubmissionFullWithExecutionResponseDTO =
    SubmissionFullWithExecutionResponseDTO(
        id = id,
        member = member.toPublicResponseDTO(),
        problem = problem.toPublicResponseDTO(),
        language = language,
        status = status,
        answer = answer,
        code = code.toResponseDTO(),
        createdAt = createdAt,
        executions = executions.map { it.toResponseDTO() },
        version = version,
    )
