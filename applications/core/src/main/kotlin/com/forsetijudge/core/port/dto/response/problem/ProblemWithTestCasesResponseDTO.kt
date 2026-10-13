package com.forsetijudge.core.port.dto.response.problem

import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseDTO
import java.io.Serializable
import java.util.UUID

data class ProblemWithTestCasesResponseDTO(
    val id: UUID,
    val createdAt: String,
    val updatedAt: String,
    val letter: Char,
    val color: String,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val testCases: AttachmentResponseDTO,
    val version: Long,
) : Serializable

fun Problem.toWithTestCasesResponseDTO(): ProblemWithTestCasesResponseDTO =
    ProblemWithTestCasesResponseDTO(
        id = id,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        letter = letter,
        color = color,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimitMs,
        memoryLimit = memoryLimitMb,
        testCases = testCases.toResponseDTO(),
        version = version,
    )
