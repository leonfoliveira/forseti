package io.github.leonfoliveira.forseti.api.adapter.dto.response.problem

import io.github.leonfoliveira.forseti.api.adapter.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.toResponseDTO
import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
import java.util.UUID

data class ProblemFullResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val testCases: AttachmentResponseDTO,
)

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO =
    ProblemFullResponseDTO(
        id = id,
        letter = letter,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases.toResponseDTO(),
    )
