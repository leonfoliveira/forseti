package com.forsetijudge.core.port.dto.response.problem

import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.port.dto.response.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.toResponseBodyDTO
import java.io.Serializable
import java.util.UUID

data class ProblemWithTestCasesResponseBodyDTO(
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

fun Problem.toWithTestCasesResponseBodyDTO(): ProblemWithTestCasesResponseBodyDTO =
    ProblemWithTestCasesResponseBodyDTO(
        id = id,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        letter = letter,
        color = color,
        title = title,
        description = description.toResponseBodyDTO(),
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases.toResponseBodyDTO(),
        version = version,
    )
