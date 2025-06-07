package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem
import java.util.UUID

data class ProblemFullResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val testCases: AttachmentResponseDTO,
)

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO {
    return ProblemFullResponseDTO(
        id = id,
        letter = letter,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        testCases = testCases.toResponseDTO(),
    )
}
