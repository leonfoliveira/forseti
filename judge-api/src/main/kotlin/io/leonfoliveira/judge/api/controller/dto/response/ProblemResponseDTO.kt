package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.service.dto.output.ProblemOutputDTO
import java.util.UUID

data class ProblemResponseDTO(
    val id: Int,
    val title: String,
    val descriptionKey: UUID,
    val timeLimit: Int,
    val testCasesKey: UUID,
)

fun ProblemOutputDTO.toResponseDTO(): ProblemResponseDTO {
    return ProblemResponseDTO(
        id = id,
        title = title,
        descriptionKey = descriptionKey,
        timeLimit = timeLimit,
        testCasesKey = testCasesKey,
    )
}
