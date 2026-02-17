package com.forsetijudge.api.adapter.dto.response.execution

import com.forsetijudge.api.adapter.dto.response.AttachmentResponseDTO
import com.forsetijudge.api.adapter.dto.response.toResponseDTO
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Submission
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

fun Execution.toResponseDTO(): ExecutionResponseDTO =
    ExecutionResponseDTO(
        id = id.toString(),
        answer = answer,
        totalTestCases = totalTestCases,
        lastTestCase = lastTestCase,
        input = input.toResponseDTO(),
        output = output.toResponseDTO(),
        createdAt = createdAt,
        version = version,
    )
