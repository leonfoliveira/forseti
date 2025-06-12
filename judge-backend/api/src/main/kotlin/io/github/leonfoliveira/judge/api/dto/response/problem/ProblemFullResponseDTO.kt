package io.github.leonfoliveira.judge.api.dto.response.problem

import io.github.leonfoliveira.judge.api.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Problem
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

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO {
    return ProblemFullResponseDTO(
        id = id,
        letter = letter,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases.toResponseDTO(),
    )
}
