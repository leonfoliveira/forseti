package com.forsetijudge.api.adapter.dto.response.problem

import com.forsetijudge.api.adapter.dto.response.AttachmentResponseDTO
import com.forsetijudge.api.adapter.dto.response.toResponseDTO
import com.forsetijudge.core.domain.entity.Problem
import java.io.Serializable
import java.util.UUID

data class ProblemFullResponseDTO(
    val id: UUID,
    val letter: Char,
    val color: String,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val testCases: AttachmentResponseDTO,
    val version: Long,
) : Serializable

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO =
    ProblemFullResponseDTO(
        id = id,
        letter = letter,
        color = color,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases.toResponseDTO(),
        version = version,
    )
