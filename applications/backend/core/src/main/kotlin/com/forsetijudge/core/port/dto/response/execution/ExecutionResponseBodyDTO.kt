package com.forsetijudge.core.port.dto.response.execution

import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime

data class ExecutionResponseDTO(
    val id: String,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val input: AttachmentResponseDTO,
    val output: AttachmentResponseDTO,
    val createdAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Execution.toResponseBodyDTO(): ExecutionResponseDTO =
    ExecutionResponseDTO(
        id = id.toString(),
        answer = answer,
        totalTestCases = totalTestCases,
        lastTestCase = approvedTestCases,
        input = input.toResponseBodyDTO(),
        output = output.toResponseBodyDTO(),
        createdAt = createdAt,
        version = version,
    )
