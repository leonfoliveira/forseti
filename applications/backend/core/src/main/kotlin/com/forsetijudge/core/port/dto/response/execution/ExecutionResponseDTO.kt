package com.forsetijudge.core.port.dto.response.execution

import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime

data class ExecutionResponseDTO(
    val id: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val maxCpuTime: Long?,
    val maxClockTime: Long?,
    val maxPeakMemory: Long?,
    val result: AttachmentResponseDTO?,
    val version: Long,
) : Serializable

fun Execution.toResponseBodyDTO(): ExecutionResponseDTO =
    ExecutionResponseDTO(
        id = id.toString(),
        createdAt = createdAt,
        updatedAt = updatedAt,
        answer = answer,
        totalTestCases = totalTestCases,
        lastTestCase = approvedTestCases,
        maxCpuTime = maxCpuTime,
        maxClockTime = maxClockTime,
        maxPeakMemory = maxPeakMemory,
        result = result?.toResponseBodyDTO(),
        version = version,
    )
